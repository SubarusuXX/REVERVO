const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const aws = require('../services/aws');   
const Arquivo = require('../models/arquivo');
const Servico = require('../models/servico');

// Rota POST para cadastrar um serviço
router.post('/', upload.array("files"), async (req, res) => {

  try {

    // 🔹 Pegando dados enviados no body da requisição
    // salaoId = id do salão
    // servico = dados do serviço (vem em JSON string)
    const { salaoId, servico } = req.body;

    // 🔹 Arrays para controlar erros e arquivos enviados
    let errors = [];
    let arquivos = [];

    // 🔹 Verifica se foram enviados arquivos
    if (req.files && req.files.length > 0) {

      // 🔹 Percorre todos os arquivos enviados
      for (let file of req.files) {

        // 🔹 Pega a extensão do arquivo
        const nameParts = file.originalname.split('.');

        // 🔹 Cria um novo nome para o arquivo usando timestamp
        const fileName = `d${new Date().getTime()}.${
          nameParts[nameParts.length - 1]
        }`;

        // 🔹 Define o caminho onde será salvo no S3
        const path = `servicos/${salaoId}/${fileName}`;

        // 🔹 FAZ O UPLOAD DO ARQUIVO PARA O AWS S3
        const response = await aws.uploadToS3(file, path);

        // 🔹 Se der erro no upload
        if (response.error) {
          errors.push({ error: true, message: response.message });
        } else {
          // 🔹 Guarda o caminho do arquivo salvo
          arquivos.push(path);
        }

      }

    }
    
    // Se algum erro aconteceu no upload
    if (errors.length > 0) {
      return res.json(errors[0]);
    }
    
    // Converte o serviço de string para objeto JSON
    let jsonServico = JSON.parse(servico);

    // aQUI ELE CRIA O SERVIÇO NO BANCO (MongoDB)
    const servicoCadastrado = await Servico(jsonServico).save();
    
    // Agora ele prepara os arquivos para salvar no banco
    arquivos = arquivos.map((arquivo) => ({
      referenciaId: servicoCadastrado._id, // relaciona com o serviço criado
      model: 'Servico',                    // indica que pertence ao modelo Servico
      caminho: arquivo                     // caminho do arquivo no S3
    }));

    //  AQUI ELE CRIA OS REGISTROS DE ARQUIVOS NO BANCO
    await Arquivo.insertMany(arquivos);

    //  Retorna para o cliente o serviço criado + arquivos
    res.json({ servico: servicoCadastrado, arquivos });

  } catch (err) {

    //  Tratamento de erro geral
    res.json({ error: true, message: err.message });

  }

});

// Rota para ATUALIZAR um serviço
router.put('/:id', upload.array("files"), async (req, res) => {
  try {

    const { salaoId, servico } = req.body;

    let errors = [];
    let arquivos = [];

    // verifica se foram enviados arquivos
    if (req.files && req.files.length > 0) {

      for (let file of req.files) {

        const nameParts = file.originalname.split('.');

        const fileName = `d${new Date().getTime()}.${
          nameParts[nameParts.length - 1]
        }`;

        const path = `servicos/${salaoId}/${fileName}`;

        // upload para S3
        const response = await aws.uploadToS3(file, path);

        if (response.error) {

          errors.push({
            error: true,
            message: response.message
          });

        } else {

          arquivos.push(path);

        }

      }

    }

    if (errors.length > 0) {
      return res.json(errors[0]);
    }

    // converte para JSON
    let jsonServico = JSON.parse(servico);

    // ⭐ ATUALIZA O SERVIÇO
    const servicoAtualizado = await Servico.findByIdAndUpdate(
      req.params.id,
      jsonServico,
      { new: true }
    );

    // prepara arquivos para salvar no banco
    arquivos = arquivos.map((arquivo) => ({
      referenciaId: servicoAtualizado._id,
      model: 'Servico',
      caminho: arquivo
    }));

    // salva arquivos
    if (arquivos.length > 0) {
      await Arquivo.insertMany(arquivos);
    }

    res.json({
      servico: servicoAtualizado,
      arquivos
    });

  } catch (err) {

    res.json({
      error: true,
      message: err.message
    });

  }

});

// Rota para DELETAR um arquivo
router.post('/delete-arquivo', async (req, res) => {

  try {

    const { key} = req.body;

    // deleta do S3
    await aws.deleteFileS3(key);

    // deleta do MongoDB
    await Arquivo.deleteOne({
      caminho: key
    });

    res.json({ error: false });

  } catch (err) {

    res.json({
      error: true,
      message: err.message
    });

  }

});

// Rota para LISTAR os serviços de um salão
router.get('/:salao/:salaoId', async (req, res) => {

  try {

    let servicosSalao = [];

    const servicos = await Servico.find({
      salaoId: req.params.salaoId,
      status: { $ne: 'E' }
    });

    for (let servico of servicos) {

      const arquivos = await Arquivo.find({
        model: 'Servico',
        referenciaId: servico._id
      });

      servicosSalao.push({
        ...servico._doc,
        arquivos
      });

    }

    res.json({
      servicos: servicosSalao
    });

  } catch (err) {

    res.json({
      error: true,
      message: err.message
    });

  }

});


// Rota para DELETAR um serviço (na verdade só muda o status para 'E' de excluído)
router.delete('/:id', async (req, res) => {

  try {

    const { id } = req.params;

    await Servico.findByIdAndUpdate(id, {
      status: 'E'
    });

    res.json({ error: false });

  } catch (err) {

    res.json({
      error: true,
      message: err.message
    });

  }

});

//  Exporta a rota para ser usada no projeto
module.exports = router;
