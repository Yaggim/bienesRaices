const jwt = require('jsonwebtoken');

const generarToken = id => jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '1d' });



const generarId = () => {
    return Math.random().toString(32).substring(2) + Date.now().toString(32);
}

module.exports = {
    generarToken,
    generarId
}