require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//Controladores
const { listEntries, getEntry, newEntry } = require('./controllers/user');

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

//RUTAS DE LA API
//GET -/user
//Devuelve todos los elementos de la tabla user
app.get('/user', listEntries);

//GET -/user/:id
//Devuelve una entradas solo
app.get('/user/:id', getEntry);

//POST -/user
//Crea una nueva entrada en la tabla user
app.post('/user', newEntry);

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