require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//Controladores
const { listUsers, getUser, newUser, editUser, deleteUser, userVote, addUserComp } = require('./controllers/user');
const { listCompanies, getCompany, addCompanyPhotos } = require('./controllers/company');

//Middlewares
const userExists = require("./middlewares/userExists");
const companyExists = require("./middlewares/companyExists");

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

//RUTAS DE LA API usuarios
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

//POST -/user/:id/votes/:company_aspects_id
//Usuario vota una empresa
app.post('/user/:id/votes/:company_aspects_id', userExists, userVote);

//POST -/user/:id/related/:company_id
//Añadir relación usuario empresa
app.post('/user/:id/related/:company_id', userExists, addUserComp);

//Rutas de la API empresas
//GET -/company
//Devuelve todos los elementos de la tabla company
app.get('/company', listCompanies);

//GET -/company/:id
//Devuelve una entradas solo
app.get('/company/:id', companyExists, getCompany);

//POST -/company/:id
//Empresa sube foto
app.post('/company/:id', companyExists, addCompanyPhotos);

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