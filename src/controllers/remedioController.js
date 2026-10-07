const Medication = require("../models/Medication");
const Appointment = require("../models/Appointment");
const { formatRemedio } = require("../config/format");
const { horaValida, hoje } = require("../config/datas");

const populado = (query) => query.populate("medico").populate("paciente");

function validar({ nome_remedio, horario_remedio, quantidade_remedio }, parcial = false) {
  if (!parcial || nome_remedio !== undefined) {
    if (!String(nome_remedio ?? "").trim()) return "nome_remedio é obrigatório.";
  }
  if (!parcial || horario_remedio !== undefined) {
    if (!horaValida(horario_remedio)) return "horario_remedio deve estar no formato HH:MM.";
  }
  if (!parcial || quantidade_remedio !== undefined) {
    if (!String(quantidade_remedio ?? "").trim()) return "quantidade_remedio é obrigatória.";
  }
  return null;
}

async function list(req, res) {
  const filtro = {};
  if (req.user.tipo === "paciente") filtro.paciente = req.user.id;
  if (req.user.tipo === "medico") filtro.medico = req.user.id;
  if (req.user.tipo !== "paciente") {
    if (req.query.consulta) filtro.consulta = req.query.consulta;
    if (req.query.paciente) filtro.paciente = req.query.paciente;
  }
  const remedios = await populado(Medication.find(filtro).sort({ horario_remedio: 1, nome_remedio: 1 }));
  res.json(remedios.map(formatRemedio));
}

async function create(req, res) {
  const { id_consulta } = req.body;
  if (!id_consulta) return res.status(400).json({ message: "id_consulta é obrigatório." });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ message: erro });

  const consulta = await Appointment.findOne({ _id: id_consulta, medico: req.user.id, status: "agendada" });
  if (!consulta) {
    return res.status(404).json({ message: "Consulta agendada não encontrada para este médico." });
  }

  const criado = await Medication.create({
    consulta: consulta._id,
    medico: req.user.id,
    paciente: consulta.paciente,
    nome_remedio: req.body.nome_remedio,
    horario_remedio: req.body.horario_remedio,
    quantidade_remedio: req.body.quantidade_remedio
  });
  const r = await populado(Medication.findById(criado._id));
  res.status(201).json(formatRemedio(r));
}

async function update(req, res) {
  const erro = validar(req.body, true);
  if (erro) return res.status(400).json({ message: erro });

  const r = await Medication.findOne({ _id: req.params.id, medico: req.user.id });
  if (!r) return res.status(404).json({ message: "Remédio não encontrado." });

  for (const campo of ["nome_remedio", "horario_remedio", "quantidade_remedio"]) {
    if (req.body[campo] !== undefined) r[campo] = req.body[campo];
  }
  await r.save();
  res.json(formatRemedio(await populado(Medication.findById(r._id))));
}

async function tomar(req, res) {
  const r = await Medication.findOne({ _id: req.params.id, paciente: req.user.id });
  if (!r) return res.status(404).json({ message: "Remédio não encontrado." });
  r.tomado_em = req.body.tomado === false ? null : hoje();
  await r.save();
  res.json(formatRemedio(await populado(Medication.findById(r._id))));
}

async function remove(req, res) {
  const filtro = { _id: req.params.id };
  if (req.user.tipo === "medico") filtro.medico = req.user.id;
  const r = await Medication.findOneAndDelete(filtro);
  if (!r) return res.status(404).json({ message: "Remédio não encontrado." });
  res.json({ message: "Remédio excluído com sucesso." });
}

module.exports = { list, create, update, tomar, remove };
