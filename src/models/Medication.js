const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  consulta: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  medico: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nome_remedio: { type: String, required: true, trim: true },
  horario_remedio: { type: String, required: true },
  quantidade_remedio: { type: String, required: true, trim: true },
  tomado_em: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Medication", medicationSchema);
