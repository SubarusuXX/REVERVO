import { produce } from 'immer';
 import types from './types'
 import moment from 'moment';


 const INITIAL_STATE = {
    behavior: 'create', //update
    components: {
    drawer: false,
    confirmDelete: false
    } ,
    form : {
        filtering: false,
        disabled: true,
        saving: false,
    },
    servicos: [],
    servico: {
    titulo: '',
    preco: '',
    comissao: '',
    duracao: moment('00:30', 'HH:mm').format(),
    recorrencia: '',
    descricao: '',
    status: 'A',
    arquivos: [],
  },
 }

function servico(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_SERVICO: {
      return produce(state, (draft) => {
        Object.assign(draft, action.servico);
      });
    }

    case types.RESET_SERVICO: {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}
 
 export default servico;
