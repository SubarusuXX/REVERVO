const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema({

  nome: {
    type: String,
    required: true
  },

  telefone: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },
 
  senha: {
    type: String,
    default: null
  },

  foto: {
    type: String,
    default: null
  },

  dataNascimento: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ['A','I'],
    default: 'A'
  },

  sexo: {
    type: String,
    enum: ['M','F']
  },

  dataCadastro: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Cliente', cliente);