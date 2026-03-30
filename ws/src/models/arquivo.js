const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const arquivo = new Schema({
    referenciaId:{
        type: Schema.Types.ObjectId,
        refPath: 'model',// referenciaId pode ser o id de um Serviço ou de um Salão
    },
    model: {
        type: String,
        required: true,
        enum: ['Servico','Salao']
    },
    caminho: {
        type: String,
        required: true,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Arquivo', arquivo);