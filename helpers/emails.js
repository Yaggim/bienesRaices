const nodemailer = require('nodemailer');

const correoRegistro = async (usuario) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = usuario;

    await transport.sendMail({
        from: 'BienesRaices@yopmail.com',
        to: email,
        subject: 'Confirma tu cuenta',
        html: `
            <html>
                <body>
                    <h1>Hola ${nombre}</h1>
                    <p>Confirma tu cuenta haciendo click en el siguiente enlace</p>
                    <a href="${process.env.BACKEND_URL}/auth/confirmar/${token}">Confirmar cuenta</a>
                </body>
            </html>
        `});
};

const correoRecuperar = async (usuario) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, token } = usuario;

    await transport.sendMail({
        from: 'BienesRaices@yopmail.com',
        to: email,
        subject: 'Recuperar contraseña',
        html: `
                <html>
                    <body>
                        <p>Resetea tu contraseña haciendo click en el siguiente enlace</p>
                        <a href="${process.env.BACKEND_URL}/auth/actualizar-password/${token}">Recuperar contraseña</a>
                    </body>
                </html>
        `
    });
};


module.exports = {
    correoRegistro,
    correoRecuperar
}