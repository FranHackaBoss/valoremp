const getDB = require("../../db");
const { deletePhoto } = require("../../helpers");

const deleteUser = async (req, res, next) => {
    let connection;
    try {
        connection = await getDB();

        const { id } = req.params;

        //Comprobar que la entrada existe
        const [current,] = await connection.query(`
            SELECT id FROM user WHERE id=?
        `, [id]);

        //Si no existe devolver un 404
        if (current.length === 0) {
            const error = new Error('No existe ninguna entrada en la base de datos con ese id');
            error.httpStatus = 404;
            throw error;
        }

        //Seleccionar la foto relacionada y borrar los ficheros de disco
        const [photos] = await connection.query(`
            SELECT photo FROM user_photo WHERE user_id=?
        `, [id]);

        console.log(photos);
        //Borrar la posible foto en user_photo
        await connection.query(`
            DELETE FROM user_photo WHERE user_id=?
        `, [id]);

        //y del disco
        for(const item of photos) {
            await deletePhoto(item.photo);
        }

        //FUTURO: borrar los posibles entradas en tablas relacionadas
        await connection.query(`
            DELETE FROM user_session WHERE user_id=?
        `, [id]);

        await connection.query(`
            DELETE FROM user_company WHERE user_id=?
        `, [id]);

        await connection.query(`
            DELETE FROM evaluation WHERE user_id=?
        `, [id]);
        //Borrar la entrada de la tabla user
        await connection.query(`
            DELETE FROM user WHERE id=?
        `, [id]);
        //Mandar confirmación
        res.send({
            status: 'ok',
            message: `El usuario con id ${id} y todos sus datos relacionados fueron borrados del sistema`
        });
    } catch(error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
}

module.exports = deleteUser;