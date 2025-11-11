const mongoose = require('mongoose');

const contenidoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es requerido'],
    enum: ['infografia', 'video', 'herramienta'],
    lowercase: true
  },
  tema: {
    type: String,
    required: [true, 'El tema es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  enlace: {
    type: String,
    required: [true, 'El enlace es requerido'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas más rápidas
contenidoSchema.index({ titulo: 'text', descripcion: 'text', tema: 'text' });

module.exports = mongoose.model('Contenido', contenidoSchema);


