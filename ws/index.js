require("dotenv").config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
require('./database');

// Middleware de upload de arquivos

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Configurações de porta
app.set('port',8000);

// Rotas
app.use('/salao', require('./src/routes/salao.routes'));
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/horario', require('./src/routes/horario.routes'));
app.use('/colaborador', require('./src/routes/colaborador.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));

app.listen(app.get('port'), () => {
    console.log(`WS  escutando na porta ${app.get('port')}` );
});