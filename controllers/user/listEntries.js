const getDB = require("../../db");
const listEntries = async (req, res, next) => {
    let connection;
    
    try {
        connection = await getDB();

        //Saco querrstring
        const { search } = req.query;

        let results;

        if (search) {
          [results] = await connection.query(`
            SELECT user.id, user.name, user.username, AVG(IFNULL(aspect1_points, 0)) AS votes
            FROM user LEFT JOIN evaluation ON (evaluation.user_id = user.id)
            WHERE user.name LIKE ? OR user.username LIKE ?
            GROUP BY user.id, user.name, user.username
            ORDER BY votes;
            `, [`%${search}%`, `%${search}%`]);
        } else {
           //Leo las entradas de la tabla user
           [results] = await connection.query(`
            SELECT user.id, user.name, user.username, AVG(IFNULL(aspect1_points, 0)) AS votes
            FROM user LEFT JOIN evaluation ON (evaluation.user_id = user.id) 
            GROUP BY user.id, user.name, user.username
            ORDER BY votes;
           `);
        }

        //Devuelvo un json con las entradas
        res.send({
            status: "ok",
            data: results,
        });
    } catch (error) {
        //Lo mandamos al middleware de error
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = listEntries;