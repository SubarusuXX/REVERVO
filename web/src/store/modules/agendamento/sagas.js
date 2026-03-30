import { all, takeLatest, call, put} from 'redux-saga/effects'
import types from './types'
import { updateAgendamento } from './actions'
import consts from '../../../consts'
import api from '../../../services/api'
import moment from 'moment';


export function* filterAgendamento({ start, end }){
    try{
        const {data: res} = yield call(api.post, '/agendamento/filter', {
            salaoId: consts.salaoId,
            periodo: {
                inicio: moment(start).subtract(1, 'month').format('YYYY-MM-DD'),
                final: moment(end).add(1, 'month').format('YYYY-MM-DD'),
            },
        });

        if (res.error){
            alert(res.message);
            return false;
        }
        yield put(updateAgendamento(res.agendamentos))

    } catch(err){
        alert(err.message);

    }
}

export default all([takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamento)]);