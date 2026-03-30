import { produce } from "immer";
import types from "./types";

const INITIAL_STATE = {
  behavior: "create", //update
  components: {
    drawer: false,
    confirmDelete: false,
    view: "week",
  },
  form: {
    filtering: false,
    disabled: true,
    saving: false,
  },
  colaboradores: [], 
  servicos: [],
  horarios: [],
  horario: {
    dias: [],
    inicio: "",
    fim: "",
    especialidades: [],
    colaboradores: [],
  },
};

function horario(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_HORARIO: {
  return produce(state, (draft) => {
    Object.assign(draft, action.payload);
  });
}

    case types.RESET_HORARIO: {
      return produce(state, (draft) => {
        draft.horario = INITIAL_STATE.horario;
        return draft;
      });
    }
    default:
      return state;
  }
}

export default horario;
