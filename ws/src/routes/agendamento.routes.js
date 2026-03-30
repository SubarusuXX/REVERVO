const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const keys = require('../data/keys.json');
const moment = require ('moment');
const util = require('../util');
const _ =require('lodash');

const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const Agendamento = require('../models/agendamento');
const Horario = require('../models/horario');
const horario = require('../models/horario');

router.post('/', async (req, res) => {

  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {

    const { clienteId, salaoId, servicoId, colaboradorId, data } = req.body;


    //fazer verificacao se ainda existe aquele horario disponivel

    // recuperar cliente
    const cliente = await Cliente.findById(clienteId)
      .select('nome email telefone');

    // recuperar salão
    const salao = await Salao.findById(salaoId)
      .select('nome');

    // recuperar serviço
    const servico = await Servico.findById(servicoId)
      .select('preco titulo comissao');

    // recuperar colaborador
    const colaborador = await Colaborador.findById(colaboradorId)
      .select('nome');

    // calcular preço
    const precoFinal = servico.preco;

    // calcular comissões
    const comissaoColaborador = (precoFinal * servico.comissao) / 100;
    const taxaApp = precoFinal * keys.app_fee;
    const taxaSalao = precoFinal - comissaoColaborador - taxaApp;

    // criar objeto semelhante ao do curso
    const createPayment = {
      amount: precoFinal,

      taxas: {
        colaborador: comissaoColaborador,
        salao: taxaSalao,
        app: taxaApp
      },

      metodo: 'LOCAL',
      status: 'PENDENTE',

      customer: {
        id: cliente._id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone
      },

      item: {
        id: servicoId,
        title: servico.titulo,
        unit_price: precoFinal,
        quantity: 1
      }
    };

    // criar agendamento
    const agendamento = await new Agendamento({
      salaoId,
      clienteId,
      servicoId,
      colaboradorId,
      data,
      valor: createPayment.amount,
      comissao: comissaoColaborador,
      pagamento: {
        metodo: createPayment.metodo,
        status: createPayment.status
      }
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      error: false,
      agendamento
    });

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    res.json({
      error: true,
      message: err.message
    });

  }

});

router.post ('/filter', async (req, res) =>{
    try{

        const { periodo, salaoId} = req.body;

        const agendamentos = await Agendamento.find({
            salaoId,
            data:{
                $gte: moment (periodo.inicio).startOf('day'),
                $lte: moment (periodo.final).endOf('day'),
            },
        }).populate([
          { path: 'servicoId', select: 'titulo duracao'},
          { path: 'colaboradorId', select: 'nome'},
          { path: 'clienteId', select: 'nome'},
        ]);

        res.json({error: false , agendamentos});
    } catch (err){
        res.json({error: true, message: err.message})
    }
})

router.post ('/dias-disponiveis', async (req, res)=>{
  try{
    const { data, salaoId, servicoId } = req.body;
    const horarios = await Horario.find ({ salaoId});
    const servico = await Servico.findById(servicoId).select('duracao');

    let agenda = [];
    let colaboradores = []
    let lastDay = moment(data);

    //duracao do servico
    const servicoMinutos = util.hourToMinutes(
     moment(servico.duracao).format('HH:mm'),
    );

    const servicoSlots = util.sliceMinutes(
      servico.duracao, //1:30
      moment(servico.duracao).add(servicoMinutos, 'minutes'), //3:00
      util.SLOT_DURATION,
    ).length;

    //procura nos proximos 365 dias
    //ate a agenda conter 7 dias disponiveis
    for (let i = 0; i <= 365 && agenda.length <= 7; i++){
      const espacosValidos = horarios.filter((horario) => {
        //verificar o dia da semana
        const diaSemanDisponivel = horario.dias.includes(moment(lastDay).day());

        // virificar a especialidade disponivel
        const servicoDisponivel = horario.especialidades.includes(servicoId);

        return diaSemanDisponivel && servicoDisponivel;
      });

      /*
      todos os colaboradores disponiveis no dia e seus horarios   
      */

      if (espacosValidos.length > 0 ){
        let todosHorariosDia = {};

        for (let spaco of espacosValidos){
          for(let colaboradorId of spaco.colaboradores) {
            if (!todosHorariosDia[colaboradorId]) {
              todosHorariosDia[colaboradorId] = []
            }

            //Pegar todos os horarios do espaço e jogar pra dentro do colaborador
            todosHorariosDia[colaboradorId] =[
              ...todosHorariosDia[colaboradorId],
              ...util.sliceMinutes(
                util.mergeDateTime(lastDay, spaco.inicio),
                util.mergeDateTime(lastDay, spaco.fim),
                util.SLOT_DURATION
              ),
            ];
          }
        }

        // ocupacao de cada especialisra no dia
        for (let colaboradorId of Object.keys(todosHorariosDia)) {
          //recuperar agendamentos
          const agendamentos = await Agendamento.find({
            colaboradorId,
            data:{
              $gte: moment(lastDay).startOf('day'),
              $lte: moment(lastDay).endOf('day'),
            },
          })
            .select('data servicoId -_id')
            .populate('servicoId', 'duracao')
          
          //recuperar horarios agendados
          let horariosOcupados = agendamentos.map((agendamento) => ({
            inicio: moment(agendamento.data),
            final: moment(agendamento.data).add(
              util.hourToMinutes(
                moment(agendamento.servicoId.duracao).format('HH:mm')
              ),
              'minutes'
            ),
          }));
          
            //recuperar todos os slots entre os agendamentos
            horariosOcupados =horariosOcupados
            .map((horario) => 
              util.sliceMinutes(
                horario.inicio, 
                horario.final,
                util.SLOT_DURATION
              )
          )
          .flat();


          //removendo todos os horarios/ slots ocupados
          let horariosLivres = util.splitByValue(
            todosHorariosDia[colaboradorId].map((horarioLivre) => {
              return horariosOcupados.includes(horarioLivre) 
            ? '-'
            : horarioLivre;
           }), 
           '-'
          )
          .filter((space) => space.length > 0);

          //verificando se existe espaco suficiente no SLOT
          horariosLivres = horariosLivres.filter(
            (horarios) => horarios.length >= servicoSlots
          );

          //verificando se os horarios dentro do SLOT
          //tem a constinuidade necessaria
          horariosLivres = horariosLivres.map((slot) => slot.filter((horario, index) => slot.length - index >= servicoSlots)
        ).flat();

        //formatando os horarios de 2 em 2 
        horariosLivres = _.chunk(horariosLivres, 2);

        //remover colaborador caso nao tenha nenhum espaço
        if (horariosLivres.length == 0){
          todosHorariosDia = _.omit(todosHorariosDia, colaboradorId);
        } else {
          todosHorariosDia[colaboradorId] = horariosLivres
        }
      }

      //verificar se tem especialista disponivel naquele dia
      const totalEspecialistas = Object.keys (todosHorariosDia).length

        if (totalEspecialistas > 0){
          colaboradores.push(Object.keys(todosHorariosDia))
          agenda.push({
            [lastDay.format('YYYY-MM-DD')]: todosHorariosDia,
          });
        }    
      }
      lastDay = lastDay.add (1, 'day');
    }
    //recupenrando dados dos colaboradores
    colaboradores = _.uniq(colaboradores.flat())

    colaboradores = await Colaborador.find({
      _id : { $in: colaboradores},
    }).select('nome foto');

    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(' ')[0],
    }))

    res.json({
      error: false,
      colaboradores,
      agenda,
    });
  }catch (err){
    res.json({error: true, message: err.message});
  }
});

module.exports = router;