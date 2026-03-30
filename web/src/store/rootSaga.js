import { all } from 'redux-saga/effects'

import agendamento from './modules/agendamento/sagas'
import clientes from './modules/cliente/sagas'
import colaborador from './modules/colaborador/sagas'
import servico from './modules/servico/sagas'
import horario from './modules/horario/sagas'

export default function* rootSaga( ) {
    return yield all([agendamento, clientes, colaborador, servico, horario]);
}   