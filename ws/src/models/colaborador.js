const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colaborador = new Schema({
nome: {
    type: String,
    required: true,
},
telefone: {
    type: String,
    required: true,
},
email: {
    type: String,
    required: true,
},
senha: {
    type: String,
    default: null,
},
foto: {
    type: String,
},
dataNascimento: {
    type: String,
    required: true,
},
status: {
    type: String,
    required: true,
    enum:['A','I'],
    default: 'A',
},
sexo: {
    type: String,
    enum:['M', 'F'],
    required: true,
},
dataCadastro: {
    type: Date,
    default: Date.now,
}
});

module.exports = mongoose.model('Colaborador', colaborador);
