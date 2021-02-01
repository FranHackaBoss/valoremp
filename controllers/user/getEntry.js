const getDB = require("../../db");

const getEntry = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        //Saco el id de los parámetros de ruta
        const { id } = req.params;
        
        //Hago la query
        const [result] = await connection.query(`
            SELECT user.id, user.name, user.surname_1, user.surname_2, user.bio, user.photo, user.city, user.email, user.username, user.password, AVG(aspect1_points) AS votes
            FROM user INNER JOIN evaluation ON (evaluation.user_id = user.id)
            WHERE user.id = ?
        `, [id]);
        
        //Desestructuro el elemento de los resultados
        const [single] = result;

        if (single.id === null) {
            //El elemento no existe
            const error = new Error('El elmento no existe');
            error.httpStatus = 404;
            throw error;
        }
        //Devuelvo un json con las entradas
        res.send({
            status: "ok",
            data: single,
        });
    } catch (error) {
        //Lo mandamos al middleware de error
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = getEntry;