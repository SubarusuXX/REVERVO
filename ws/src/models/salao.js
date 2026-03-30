const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Salao = new Schema({
nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
},
foto: String,
capa: String,
email: {
    type: String,
    required: [true, "Email é obrigatório"],
},
telefone: String,
senha: {
    type: String,
    default: null
},
endereco:{
    cidade:String,
    uf:String,
    cep:String,
    numero:String,
    pais:String,
},
geo:{
    tipo:String,
    coordinates: [Number],
},
dataCadastro: {
    type: Date,
    default: Date.now,
}
});

Salao.index({ geo: '2dsphere' });
module.exports = mongoose.model('Salao', Salao);
