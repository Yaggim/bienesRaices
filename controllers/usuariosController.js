
const { check, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario.js');
const { generarId, generarToken } = require('../helpers/tokens.js');
const { correoRegistro, correoRecuperar } = require('../helpers/emails.js');
const bcrypt = require('bcrypt');

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesión',
        csrfToken: req.csrfToken()
    });
};

const autenticar = async (req, res) => {

    await check('email').isEmail().withMessage('El email contiene un formato erroneo').run(req);
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const { email, password } = req.body;

    //Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where : { email } });

    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [
                {msg: 'Usuario o contraseña invalido'}
            ],
            csrfToken: req.csrfToken()
        });
    }

    //Verificar si la password es correcta
    if(!bcrypt.compareSync(password, usuario.password)){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [
                {msg: 'Usuario o contraseña invalido'}
            ],
            csrfToken: req.csrfToken()
        });
    }

    //Verificar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [
                {msg: 'La cuenta no esta confirmada'}
            ],
            csrfToken: req.csrfToken()
        });
    }
   
    
    const token = generarToken(usuario.id);

    return res.cookie('token', token, { httpOnly: true }).redirect('/mis-propiedades');
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    });
};

const registrar = async (req, res) => {
    //validaciones

    await check('nombre').notEmpty().withMessage('En nombre no puede ser vacio').run(req);
    await check('email').isEmail().withMessage('El email contiene un formato erroneo').run(req);
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe contener minimo 6 caracteres').run(req);
    //await check('repetir_password').equals('password').withMessage('Debe repetir la contraseña').run(req);

    await check('repetir_password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Las contraseñas no coinciden')
        .run(req);

    let resultado = validationResult(req);


    if (!resultado.isEmpty()){ 
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            },
            csrfToken: req.csrfToken()
        });
    }

    const { nombre, email, password } = req.body;

    //verificar si el email ya esta registrado
    const existeUsuario = await Usuario.findOne({ where : { email } });
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [
                {msg: 'El email ya esta registrado'}
            ],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            },
            csrfToken: req.csrfToken()
        });
    }


    //inserto usuario en la base de datos
    const usuario = await Usuario.create({nombre, email, password, token: generarId()});
    
    //Enviar correo de confirmación
    await correoRegistro(
        {
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        }
    );

    //Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Confirmar cuenta',
        mensaje: 'Se ha enviado un mensaje a tu correo para confirmar tu cuenta',
        csrfToken: req.csrfToken()
    });
    
};

const confirmarCuenta = async (req, res) => {
    const { token } = req.params;

    //Verificar si el token es válido

    const existeUsuario = await Usuario.findOne({ where : { token } });

    if(!existeUsuario){
        return res.render('auth/confirmar', {
            pagina: 'Confirmar cuenta',
            error: true,
            mensaje: 'El token no es válido'
        });
    }


    //Confirmar la cuenta
    existeUsuario.token = null;
    existeUsuario.confirmado = true;

    await existeUsuario.save();
    

    return res.render('auth/confirmar', {
        pagina: 'Confirmar cuenta',
        error: false,
        mensaje: 'Cuenta confirmada'
    });
}

const formularioRecuperar = (req, res) => {
    res.render('auth/recuperar', {
        pagina: 'Recuperar cuenta',
        csrfToken: req.csrfToken()
    });
};

const recuperarPassword = async (req, res) => {
    await check('email').isEmail().withMessage('El email contiene un formato erroneo').run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()){ 
        return res.render('auth/recuperar', {
            pagina: 'Recuperar cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }


    //Verificar si el email existe

    const { email } = req.body;

    const usuario = await Usuario.findOne({ where : { email } });

    //Si el usuario no existe
    if(!usuario){
        return res.render('auth/recuperar', {
            pagina: 'Recuperar cuenta',
            errores: [
                {msg: 'El email no esta registrado'}
            ],
            csrfToken: req.csrfToken()
        });
    }

    //Generar token si el usuario existe
    usuario.token = generarId();
    await usuario.save();

    //Enviar correo de recuperación
    await correoRecuperar(
        {
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        }
    );

    //Mostrar mensaje de recuperación
    res.render('templates/mensaje', {
        pagina: 'Actualizar contraseña',
        mensaje: 'Se ha enviado un mensaje a tu correo para actualizar tu contraseña',
        csrfToken: req.csrfToken()
    });
};

const formularioPassword = async (req, res) => {
    const { token } = req.params;

    //Verificar si el token es válido

    const usuario = await Usuario.findOne({ where : { token } });

    if(!usuario){
        return res.render('auth/confirmar', {
            pagina: 'Actualizar password',
            error: true,
            mensaje: 'El token no es válido'
        });
    }

    res.render('auth/actualizar-password', {
        pagina: 'Nueva contraseña',
        csrfToken: req.csrfToken()
    });
};

const actualizarPassword = async (req, res) => {
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe contener minimo 6 caracteres').run(req);
    //await check('repetir_password').equals('password').withMessage('Debe repetir la contraseña').run(req);

    await check('repetir_password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Las contraseñas no coinciden')
        .run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()){ 
        return res.render('auth/actualizar-password', {
            pagina: 'Nueva contraseña',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const { password } = req.body;

    const { token } = req.params;

    //Verificar si el token es válido

    const usuario = await Usuario.findOne({ where : { token } });

    //Actualizar la contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);   
    usuario.token = null;
    await usuario.save();

    //Mostrar mensaje de confirmación
    return res.render('auth/confirmar', {
        pagina: 'Actualizar contraseña',
        error: false,
        mensaje: 'Contraseña actualizada correctamente'
    });
}

module.exports = {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmarCuenta,
    formularioRecuperar,
    recuperarPassword,
    formularioPassword,
    actualizarPassword
}