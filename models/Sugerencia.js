const mongoose = require('mongoose');

const sugerenciaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    default: 'Anónimo',
    trim: true
  },
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo válido']
  },
  texto: {
    type: String,
    required: [true, 'El texto de la sugerencia es requerido'],
    trim: true,
    minlength: [10, 'La sugerencia debe tener al menos 10 caracteres']
  },
  leida: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sugerencia', sugerenciaSchema);


