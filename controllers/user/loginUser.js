const getDB = require("../../db");

const loginUser = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        //Recoger el email y la password de req.body


        //Si el email o password están vacios enviamos un error


        //Seleccionar el usuario de la BBDD con ese email y password


        //Sí no existe asumimos que el email o la password son incorrectos


        //Sí existe y no está activo avisamos de que está pendiente de activar


        //Asumimos que el login es correcto

        res.send({
            message: 'Logear usuario'
        })
    } catch(error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = loginUser;