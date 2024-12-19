const express = require('express');
const { admin } = require('../controllers/propiedadesController.js');

const router = express.Router();

router.get('/mis-propiedades', admin);

module.exports = router;