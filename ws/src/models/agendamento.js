const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamento = new Schema({

  salaoId: {
    type: Schema.Types.ObjectId,
    ref: 'Salao',
    required: true,
  },

  clienteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },

  servicoId: {
    type: Schema.Types.ObjectId,
    ref: 'Servico',
    required: true,
  },

  colaboradorId: {
    type: Schema.Types.ObjectId,
    ref: 'Colaborador',
    required: true,
  },

  data: {
    type: Date,
    required: true,
  },

  valor: {
    type: Number,
    required: true,
  },

  comissao: {
    type: Number,
    required: true,
  },

pagamento: {
  type: {
    metodo: {
      type: String,
      enum: ['LOCAL','PIX','DINHEIRO','CARTAO'],
      default: 'LOCAL'
    },
    status: {
      type: String,
      enum: ['PENDENTE','PAGO'],
      default: 'PENDENTE'
    }
  },
  default: {
    metodo: 'LOCAL',
    status: 'PENDENTE'
  }
},
  status: {
    type: String,
    enum: ['A','C'], // A = ativo / C = cancelado
    default: 'A'
  },

  dataCadastro: {
    type: Date,
    default: Date.now,
  }

});

module.exports = mongoose.model('Agendamento', agendamento);