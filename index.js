const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const usuarioRoutes = require('./routes/usuariosRoutes.js');
const propiedadesRoutes = require('./routes/propiedadesRoutes.js');
const db = require('./config/db.js');

//Creo la aplicacion de express
const app = express();

//Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

//Habilitar cookie parser
app.use(cookieParser());

//Habilitar CSRF
app.use(csrf({ cookie: true }));

//Conexion a la base de datos
async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    console.log('Conectado a la base de datos');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

connectDB();

//Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

//carpeta publica
app.use(express.static('public'));

//routing
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);

//Defino el puerto
const port = 3003;

//Escucho el puerto y recibo un callback con un mensaje en consola.
app.listen(port, () => {
  console.log(`Server corriendo en el puerto ${port}`);
});