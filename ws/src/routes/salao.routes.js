const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const turf = require('@turf/turf');

// Rota para criar um novo salão
router.post('/', async (req, res) => {
    try {
        const salao = await new Salao(req.body).save();
        res.json({ salao });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

// Rota para listar os serviços de um salao
router.get('/servicos/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        const servicos = await Servico.find({ 
            salaoId,
            status: 'A'
        }).select('_id titulo');

        // [{label: "servicço ", value: "121321321"}] 
        res.json({ 
            servicos: servicos.map (s => ({ label: s.titulo, value: s._id }))
         });

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const salao = await Salao.findById(req.params.id).select(
             'capa nome endereco.cidade geo.coordinates telefone'
            );

            //distacia usando o TURF
            const distance = turf.distance(
                turf.point(salao.geo.coordinates),
                turf.point([-53.0519, -25.7483])
            );

        res.json({ error: false, salao, distance });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});



module.exports = router;