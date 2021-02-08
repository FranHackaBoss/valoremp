const getDB = require("../../db");

const deleteUserPhoto = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        res.send({
            message: 'Borrar foto de usuario'
        })
    } catch(error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = deleteUserPhoto;