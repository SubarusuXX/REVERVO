const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salaoCliente');

router.post('/', async (req, res) => {

  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {

    const { cliente, salaoId } = req.body;

    let newCliente = null;

    // verificar se já existe cliente
    const existentCliente = await Cliente.findOne({
      $or: [
        { email: cliente.email },
        { telefone: cliente.telefone }
      ]
    });

    // se não existir, cria
    if (!existentCliente) {
      newCliente = await Cliente({
        ...cliente
      }).save({ session });

    }

    // pegar ID do cliente
    const clienteId = existentCliente
      ? existentCliente._id
      : newCliente._id;

    // verificar relacionamento cliente ↔ salão
    const existingRelationship = await SalaoCliente.findOne({
      salaoId,
      clienteId,
      status: { $ne: 'E' }
    });

    // se não existir relacionamento
    if (!existingRelationship) {

      await SalaoCliente({
        salaoId,
        clienteId,
        status: 'A'
      }).save({ session });

    }

    // se já existir relacionamento
    if (existingRelationship) {

      await SalaoCliente.findOneAndUpdate(
        {
          salaoId,
          clienteId
        },
        { status: 'A' },
        { session }
      );

    }

    await session.commitTransaction();
    session.endSession();

    if (existentCliente && existingRelationship) {
      res.json({ error: true, message: 'Cliente já cadastrado' });
    } else {
      res.json({ error: false, clienteId });
    }

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.json({
      error: true,
      message: error.message
    });

  }

});

router.post('/filter', async (req, res) => {
  try {

  const clientes = await Cliente.find(req.body.filters);
  res.json({ error: false, clientes });

  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;
    
    //recuperando vinculos
    const clientes = await SalaoCliente.find({
      salaoId,
      status: { $ne: 'E' },
    })
      .populate('clienteId')
      .select('clienteId dataCadastro');


     const clientesFormatados = clientes
      .filter(vinculo => vinculo.clienteId)
      .map((vinculo) => ({
        ...vinculo.clienteId.toObject(),
        vinculoId: vinculo._id,
        vinculo: vinculo.status,
        dataCadastro: vinculo.dataCadastro,
      }));

    return res.json({
      error: false,
      clientes: clientesFormatados,
    });


  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

router.delete('/vinculo/:id', async (req, res) => {
  try {
    await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'E' });
    res.json({ error: false });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

module.exports = router;