require("dotenv").config();
const express = require("express");

const morgan = require("morgan");

//Controladores
const { listEntries, getEntry } = require('./controllers/user');

const { PORT } = process.env;

//Creo la app de express
const app = express();

//Aplico middlewares
app.use(morgan("dev"));

//Rutas de la API

//GET -/entries
//Devuelve todos los elementos de la tabla user
app.get('/user', listEntries);

//GET -/user/:id
//Devuelve una entradas solo
app.get('/user/:id', getEntry);

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