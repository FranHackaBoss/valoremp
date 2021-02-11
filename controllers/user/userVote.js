const getDB = require("../../db");

const userVote = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
         
        const { id, company_id } = req.params;
        const { evaluation_date, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points } = req.body;

        //Compruebo que el id del usuario que queremos modificar se corresponde con el token
        if(+id !== req.auth.id) {
            const error = new Error('El token no es válido');
            error.httpStatus = 401;
            throw error;
        }

        //Compruebo que existe relación entre el usuario y la empresa
        const [relationship] = await connection.query(`
            SELECT id 
            FROM user_company
            WHERE user_id=? AND company_id=?
            `, [id, company_id]);

        //Sí no existe la relación lanzo un error
        if (relationship.length === 0) {
            const error = new Error('No existe relación entre el usuario y la empresa');
            error.httpStatus = 403;
            throw(error);
        }

        //Sí la puntuación no se encuentra entre 0 y 10 lanzo un error
        if(aspect1_points < 1 || aspect1_points > 10 || aspect2_points < 1 || aspect2_points > 10 || aspect3_points < 1 || aspect3_points > 10 || aspect4_points < 1 || aspect4_points > 10 || aspect5_points < 1 || aspect5_points > 10) {
            const error = new Error('La puntuación debe de estar entre 0 y 10');
            error.httpStatus = 400;
            throw(error);
        }
        //Compruebo si el usuario ya ha votado
        const [currentVotes] = await connection.query(`
            SELECT aspect1_points FROM evaluation WHERE user_id=? AND company_id=?
        `, [id, company_id]);

        //Si ya ha votado devolvemos un error
        if(currentVotes.length >= 1) {
            const error = new Error('El usuario ya ha votado a esta empresa');
            error.httpStatus = 403;
            throw error;
        }

        //Si falta alguno de los campo obligatorios lanzo un Bad request
        if (!id || !company_id || !aspect1_points) {
            const error = new Error("Faltan campos obligatorios");
            error.httpStatus = 400;
            throw error;
        }

        //Ejecuto la inserción en la BBDD
        const now = new Date();

        await connection.query(`
            INSERT INTO evaluation (company_id, user_id, evaluation_date, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?);
        `, [company_id, id, now, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points]);

        const [results] = await connection.query(`
            SELECT SUM(aspect1_points + aspect2_points + aspect3_points + aspect4_points + aspect5_points) AS total
            FROM evaluation
            WHERE user_id=? AND company_id=?
            `, [id, company_id]);

        //Calculo la ponderación en función de los años del usuario en la empresa
        const [startDate] = await connection.query(`
            SELECT starting_date 
            FROM user_company
            WHERE user_id=? AND company_id=?
        `, [id, company_id]);
        
        const [endDate] = await connection.query(`
            SELECT end_date 
            FROM user_company
            WHERE user_id=? AND company_id=?
        `, [id, company_id]);

        
        console.log(startDate[0].starting_date, endDate[0].end_date);

        let timeGap = endDate[0].end_date.getFullYear() - startDate[0].starting_date.getFullYear();
        console.log(results[0].total);

        let finalScore = Math.round(results[0].total * (1 + (timeGap * 0.1)));

        res.send({
            status: "ok",
            data: {
                company_id,
                id,
                evaluation_date,
                aspect1_points,
                aspect2_points,
                aspect3_points,
                aspect4_points,
                aspect5_points,
                total: results,
                final: finalScore
            }
        });
    } catch(error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = userVote;