const getDB = require("../../db");
const { deletePhoto } = require("../../helpers");

const deleteUserPhoto = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;

        //Selecciono la foto en la BBDD
        const [current] = await connection.query(`
            SELECT photo FROM user_photo WHERE user_id=?
        `, [id]);

        //Si la foto no existe devuelvo un error 
        if(current.length === 0) {
            const error = new Error('El usuario no tiene foto');
            error.httpStatus = 404;
            throw(error);
        }

        //Borrar la foto de disco
        await deletePhoto(current[0].photo);

        //Borrar foto de la BBDD
        await connection.query(`
            DELETE FROM user_photo WHERE user_id=?
        `, [[id]]);

        res.send({
            status: "ok",
            message: `Foto de usuario ${id} eliminada`
        })
    } catch(error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = deleteUserPhoto;