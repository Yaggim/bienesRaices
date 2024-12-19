const { DataTypes } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const Usuario = db.define('usuarios', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},{
    hooks: {
        beforeCreate: async function(usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);            
        }
    }
});

module.exports = Usuario;