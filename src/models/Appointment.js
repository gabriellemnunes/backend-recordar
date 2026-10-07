const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  medico: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clinica: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  data_consulta: { type: String, required: true },
  horario_consulta: { type: String, required: true },
  status: { type: String, enum: ["disponivel", "agendada"], default: "disponivel" },

  queixa_principal: { type: String, default: "" },
  sintomas: { type: String, default: "" },
  inicio_sintomas: { type: String, default: "" },
  condicoes_saude: { type: String, default: "" },
  alergias: { type: String, default: "" },
  medicamentos_em_uso: { type: String, default: "" }
}, { timestamps: true });

appointmentSchema.index({ medico: 1, data_consulta: 1, horario_consulta: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
