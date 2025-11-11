const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema(
  {
    recurso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contenido',
      required: true,
      index: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    autorNombre: {
      type: String,
      required: true,
      trim: true,
    },
    autorCorreo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    texto: {
      type: String,
      required: [true, 'El comentario no puede estar vacío'],
      trim: true,
      minlength: [3, 'El comentario debe tener al menos 3 caracteres'],
      maxlength: [800, 'El comentario no puede exceder los 800 caracteres'],
    },
    aprobado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

comentarioSchema.index({ recurso: 1, createdAt: -1 });

module.exports = mongoose.model('Comentario', comentarioSchema);


