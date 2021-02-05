const getDB = require("../../db");

const addEntryPhoto = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        res.send({
            message: 'Añadir foto a un usuario',
        })
    } catch(error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
}

module.exports = addEntryPhoto;