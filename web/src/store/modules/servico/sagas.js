import { takeLatest, all, call, put, select } from "redux-saga/effects";
import {
  updateServico,
  resetServico,
  allServicos as AllServicosAction,
  
} from "./actions";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts";

export function* allServicos() {
  const { form } = yield select((state) => state.servico);

  try {
    yield put(updateServico({ form: { ...form, filtering: true } }));
    const { data: res } = yield call(
      api.get,
      `/servico/salao/${consts.salaoId}`,
    );

    yield put(updateServico({ form: { ...form, filtering: false } }));

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateServico({ servicos: res.servicos }));
  } catch (err) {
    yield put(updateServico({ form: { ...form, filtering: false } }));

    alert(err.message);
  }
}

export function* addServico() {
  const { form, servico, components, behavior } = yield select(
    (state) => state.servico,
  );

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));

    const formData = new FormData();
    formData.append(
        "servico",
         JSON.stringify({ ...servico, salaoId: consts.salaoId })
        );
    formData.append("salaoId", consts.salaoId);
    servico.arquivos.map((a, i) => {
      formData.append(`arquivo_${i}`, a);
    });

    const { data: res } = yield call(
        api[behavior === 'create' ? 'post' : 'put'],
        behavior === 'create' ? '/servico' : `/servico/${servico._id}`,
        formData);

    yield put(updateServico({ form: { ...form, saving: false } }));

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(AllServicosAction());
    yield put(
      updateServico({
        components: { ...components, drawer: false },
      }),
    );
    yield put(resetServico());
  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    alert(err.message);
  }
}

export function* removeServico() {
  const { form, servico, components } = yield select(
    (state) => state.servico,
  );

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));
    const { data: res } = yield call(
      api.delete,
      `/servico/${servico._id}`,
    );

    yield put(
      updateServico({
        form: { ...form, saving: false },
        components: { ...components, confirmDelete: false },
      }),
    );

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(AllServicosAction());
    yield put(
      updateServico({
        components: { ...components, drawer: false, confirmDelete: false },
      }),
    );
    yield put(resetServico());
  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    alert(err.message);
  }
}

export function* removeArquivo({ key }) {
  const { form, components } = yield select((state) => state.servico);

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));
    const { data: res } = yield call(api.post,  `/servico/delete-arquivo/`,{
        key
    });

    yield put(
      updateServico({
        form: { ...form, saving: false },
        components: { ...components, confirmDelete: false },
      }),
    );

    if (res.error) {
      alert(res.message);
      return false;
    }

  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    alert(err.message);
  }
}

export default all([
  takeLatest(types.ALL_SERVICOS, allServicos),
  takeLatest(types.ADD_SERVICO, addServico),
  takeLatest(types.REMOVE_SERVICO, removeServico),
  takeLatest(types.REMOVE_ARQUIVO, removeArquivo),
]);
