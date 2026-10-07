const Appointment = require("../models/Appointment");
const Medication = require("../models/Medication");
const { formatConsulta } = require("../config/format");
const { hoje, dataValida, horaValida } = require("../config/datas");
const User = require("../models/User");
const { idValido } = require("../config/vinculos");

const CAMPOS_ANAMNESE = [
  "queixa_principal", "sintomas", "inicio_sintomas",
  "condicoes_saude", "alergias", "medicamentos_em_uso"
];
const ORDEM = { data_consulta: 1, horario_consulta: 1 };

const populada = (query) => query
  .populate({ path: "medico", populate: { path: "especialidade" } })
  .populate("paciente")
  .populate("clinica");
const ehDono = (id, req) => id && id.toString() === req.user.id;

async function list(req, res) {
  const filtro = {};
  if (req.user.tipo === "paciente") {
    filtro.paciente = req.user.id;
    filtro.status = "agendada";
  } else {
    if (req.user.tipo === "medico") filtro.medico = req.user.id;
    if (["disponivel", "agendada"].includes(req.query.status)) filtro.status = req.query.status;
  }

  const consultas = await populada(Appointment.find(filtro).sort(ORDEM));
  const comAnamnese = req.user.tipo !== "administrador";
  res.json(consultas.map((c) => formatConsulta(c, { comAnamnese })));
}

async function disponiveis(req, res) {
  const filtro = { status: "disponivel", data_consulta: { $gte: hoje() } };
  const { medico, clinica, especialidade, data } = req.query;
  if ([medico, clinica, especialidade].some((id) => id && !idValido(id))) return res.json([]);

  if (medico) filtro.medico = medico;
  if (clinica) filtro.clinica = clinica;
  if (data && dataValida(data) && data >= hoje()) filtro.data_consulta = data;
  if (especialidade) {
    const medicos = await User.find({ tipo: "medico", especialidade }).select("_id");
    const ids = medicos.map((m) => m._id).filter((id) => !medico || String(id) === medico);
    filtro.medico = { $in: ids };
  }
  const consultas = await populada(Appointment.find(filtro).sort(ORDEM));
  res.json(consultas.map((c) => formatConsulta(c)));
}

async function meusPacientes(req, res) {
  const consultas = await populada(Appointment.find({ medico: req.user.id, status: "agendada" }).sort(ORDEM));
  const busca = String(req.query.busca || "").toLowerCase();

  const lista = consultas
    .filter((c) => c.paciente && c.paciente.nome_usuario.toLowerCase().includes(busca))
    .map((c) => {
      const f = formatConsulta(c);
      return {
        id_consulta: f.id,
        id_paciente: f.id_paciente,
        nome_paciente: f.nome_paciente,
        idade_paciente: f.idade_paciente,
        data_consulta: f.data_consulta,
        horario_consulta: f.horario_consulta
      };
    });
  res.json(lista);
}

async function getById(req, res) {
  const c = await populada(Appointment.findById(req.params.id));
  if (!c) return res.status(404).json({ message: "Consulta não encontrada." });

  const admin = req.user.tipo === "administrador";
  const participa = ehDono(c.medico?._id, req) || ehDono(c.paciente?._id, req);
  const livreParaPaciente = req.user.tipo === "paciente" && c.status === "disponivel";
  if (!admin && !participa && !livreParaPaciente) {
    return res.status(403).json({ message: "Acesso não autorizado." });
  }
  res.json(formatConsulta(c, { comAnamnese: participa }));
}

async function create(req, res) {
  const { data_consulta, horario_consulta, id_clinica } = req.body;
  const minhasClinicas = (req.user.doc.clinicas || []).map((c) => String(c._id));
  if (!minhasClinicas.length) {
    return res.status(400).json({ message: "Associe-se a uma clínica no seu Perfil antes de criar consultas." });
  }
  if (!id_clinica || !minhasClinicas.includes(String(id_clinica))) {
    return res.status(400).json({ message: "Escolha uma das clínicas em que você atende." });
  }
  if (!dataValida(data_consulta)) {
    return res.status(400).json({ message: "data_consulta deve estar no formato AAAA-MM-DD." });
  }
  if (!horaValida(horario_consulta)) {
    return res.status(400).json({ message: "horario_consulta deve estar no formato HH:MM." });
  }
  if (data_consulta < hoje()) {
    return res.status(400).json({ message: "Não é possível criar consulta em uma data que já passou." });
  }

  if (await Appointment.exists({ medico: req.user.id, data_consulta, horario_consulta })) {
    return res.status(409).json({ message: "Você já tem uma consulta nesse dia e horário." });
  }

  const criada = await Appointment.create({ medico: req.user.id, clinica: id_clinica, data_consulta, horario_consulta });
  const c = await populada(Appointment.findById(criada._id));
  res.status(201).json(formatConsulta(c));
}

async function agendar(req, res) {
  const anamnese = {};
  for (const campo of CAMPOS_ANAMNESE) {
    anamnese[campo] = String(req.body[campo] ?? "").trim();
  }
  if (!anamnese.queixa_principal) {
    return res.status(400).json({ message: "queixa_principal é obrigatória." });
  }

  const c = await populada(Appointment.findOneAndUpdate(
    { _id: req.params.id, status: "disponivel" },
    { $set: { ...anamnese, paciente: req.user.id, status: "agendada" } },
    { new: true }
  ));
  if (!c) return res.status(409).json({ message: "Esta consulta não está mais disponível." });
  res.json(formatConsulta(c, { comAnamnese: true }));
}

async function cancelar(req, res) {
  const c = await Appointment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Consulta não encontrada." });

  const pode = req.user.tipo === "administrador" || ehDono(c.medico, req) || ehDono(c.paciente, req);
  if (!pode) return res.status(403).json({ message: "Acesso não autorizado." });
  if (c.status !== "agendada") {
    return res.status(400).json({ message: "Esta consulta não está agendada." });
  }

  await Medication.deleteMany({ consulta: c._id });
  c.paciente = null;
  c.status = "disponivel";
  for (const campo of CAMPOS_ANAMNESE) c[campo] = "";
  await c.save();

  res.json({ message: "Consulta cancelada com sucesso." });
}

async function remove(req, res) {
  const c = await Appointment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Consulta não encontrada." });
  if (req.user.tipo !== "administrador" && !ehDono(c.medico, req)) {
    return res.status(403).json({ message: "Acesso não autorizado." });
  }

  await Medication.deleteMany({ consulta: c._id });
  await c.deleteOne();
  res.json({ message: "Consulta excluída com sucesso." });
}

module.exports = { list, disponiveis, meusPacientes, getById, create, agendar, cancelar, remove };
