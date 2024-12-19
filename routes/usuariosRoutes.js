const express = require('express');
const { formularioLogin, autenticar, formularioRegistro, formularioRecuperar, registrar, confirmarCuenta, recuperarPassword, formularioPassword, actualizarPassword } = require('../controllers/usuariosController.js');

const router = express.Router();

router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmarCuenta);

router.get('/recuperar', formularioRecuperar);
router.post('/recuperar', recuperarPassword);

router.get('/actualizar-password/:token', formularioPassword);
router.post('/actualizar-password/:token', actualizarPassword);

module.exports = router;