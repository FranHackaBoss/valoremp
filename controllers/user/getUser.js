const getDB = require("../../db");

const getUser = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        //Saco el id de los parámetros de ruta
        const { id } = req.params;
        
        //Hago la query
        const [result] = await connection.query(`
            SELECT user.signup_date, user.id, user.name, user.surname_1, user.surname_2, user.bio, user.city, user.email, user.username, user.password
            FROM user
            WHERE user.id = ?
        `, [id]);
        
        
        //Devuelvo un json con las entradas
        res.send({
            status: "ok",
            data: result
        });
    } catch (error) {
        //Lo mandamos al middleware de error
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = getUser;