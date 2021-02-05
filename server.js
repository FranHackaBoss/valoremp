require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//Controladores
const { listUsers, getUser, newUser, editUser, deleteUser, addUserPhoto } = require('./controllers/user');


//Middlewares
const userExists = require("./middlewares/userExists");

const { PORT } = process.env;

//Creo la app de express
const app = express();

//APLICO MIDDLEWARES
//Logger
app.use(morgan("dev"));

//Body-parsers (body en JSON)
app.use(bodyParser.json());

//Body parser (multipart form data <- subida imágenes)
app.use(fileUpload());

//Static
app.use(express.static(path.join(__dirname, "static")));

//RUTAS DE LA API
//GET -/user
//Devuelve todos los elementos de la tabla user
app.get('/user', listUsers);

//GET -/user/:id
//Devuelve una entradas solo
app.get('/user/:id', userExists, getUser);

//POST -/user
//Crea una nueva entrada en la tabla user
app.post('/user', newUser);

//PUT -/user/:id
//Edita una entrada en la base de datos
app.put('/user/:id', userExists, editUser);

//DELETE -/user/:id
//Borra una entrada a la BBDD
app.delete("/user/:id", userExists, deleteUser);

//POST -/user/:id/user_photo
//Añadir foto de usuario
app.post('/user/:id', userExists, addUserPhoto);

//Middleware de error
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.httpStatus || 500).send({
        status: "error",
        message: error.message,
    });
});

//Middleware de 404
app.use((req, res) => {
    res.status(404).send({
        status: "error",
        message: "Not found",
    });
});

//Inicio el servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT} 🚀`);
});