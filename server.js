require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//Controladores
const { listUsers, getUser, newUser, validateUser, loginUser, editUser, deleteUser, userVote, addUserComp } = require('./controllers/user');
const { listCompanies, getCompany, addCompanyPhotos, deleteCompanyPhoto, editCompany, createCompanyAspects, editCompanyAspects, deleteCompany } = require('./controllers/company');

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
//Crea un usuario pendiente de activar
app.post('/user', newUser);

//GET -/user/validate/:validationCode
//Valida un usuario no activado
app.get('/user/validate/:registrationCode', validateUser);

//POST -/user/login
//Hacer el login del usuario
app.post('/user/login', loginUser);

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

//POST -/company/:id/photos
//Empresa sube foto
app.post('/company/:id/photos', companyExists, addCompanyPhotos);

// DELETE - /company/:id/photos/:photoID
// Borra una foto de la empresa
app.delete("/company/:id/photos/:photoID", companyExists, deleteCompanyPhoto);

// PUT - /company/:id
// Edita una empresa en la BBDD
app.put("/company/:id", companyExists, editCompany);

//POST -/company/:id/aspects
//Introduce los aspectos a valorar
app.post("/company/:id/aspects", companyExists, createCompanyAspects);

//PUT -/company/:id/edit_aspects
//Editar aspectos a valorar
app.put("/company/:id/edit_aspects", companyExists, editCompanyAspects);

//DELETE -/company/:id
//Borrar empresa
app.delete("/company/:id", companyExists, deleteCompany);

//POST -/company
//Nueva entrada tabla empresa


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