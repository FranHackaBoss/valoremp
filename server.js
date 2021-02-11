require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//Controladores
const { listUsers, getUser, newUser, validateUser, loginUser, editUser, deleteUser, userVote, addUserComp } = require('./controllers/user');
const { listCompanies, getCompany, newCompany, validateCompany, loginCompany, addCompanyPhotos, deleteCompanyPhoto, editCompany, createCompanyAspects, editCompanyAspects, deleteCompany } = require('./controllers/company');

//Middlewares
const userExists = require("./middlewares/userExists");
const companyExists = require("./middlewares/companyExists");
const isAuthorized = require("./middlewares/isAuthorized");

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

//RUTAS DE LA API USUARIOS

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

//PUT -/user/:id(token)
//Edita un usuario en la base de datos
app.put('/user/:id', isAuthorized, userExists, editUser);

//DELETE -/user/:id(token)
//Borra un usuario a la BBDD
app.delete("/user/:id", userExists, deleteUser);

//POST -/user/:id/votes/:company_id(token)
//Usuario vota una empresa
app.post('/user/:id/votes/:company_id', isAuthorized, userExists, userVote);

//POST -/user/:id/related/:company_id(token)
//Añadir relación usuario empresa
app.post('/user/:id/related/:company_id', userExists, addUserComp);

//Rutas DE LA API EMPRESAS

//GET -/company
//Devuelve todos los elementos de la tabla company
app.get('/company', listCompanies);

//GET -/company/:id
//Devuelve una entradas solo
app.get('/company/:id', companyExists, getCompany);

//POST -/company
//Nueva entrada tabla empresa
app.post('/company', newCompany);

//GET -/company/validate/:validationCode
//Valida una empresa no activada
app.get('/company/validate/:registrationCode', validateCompany);

//POST -/company/login
//Hacer el login de la empresa
app.post('/company/login', loginCompany);

//POST -/company/:id/photos(token)
//Empresa sube foto
app.post('/company/:id/photos', companyExists, addCompanyPhotos);

// DELETE - /company/:id/photos/:photoID(token)
// Borra una foto de la empresa
app.delete("/company/:id/photos/:photoID", companyExists, deleteCompanyPhoto);

// PUT - /company/:id(token)
// Edita una empresa en la BBDD
app.put("/company/:id", companyExists, editCompany);

//POST -/company/:id/aspects(token)
//Introduce los aspectos a valorar
app.post("/company/:id/aspects", companyExists, createCompanyAspects);

//PUT -/company/:id/edit_aspects(token)
//Editar aspectos a valorar
app.put("/company/:id/edit_aspects", companyExists, editCompanyAspects);

//DELETE -/company/:id(token)
//Borrar empresa
app.delete("/company/:id", companyExists, deleteCompany);


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