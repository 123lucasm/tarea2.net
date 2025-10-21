const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Categoria', categoriaSchema);


