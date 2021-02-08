const getDB = require("../../db");

const userVote = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
         
        const { id, company_aspects_id } = req.params;
        const { evaluation_date, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points } = req.body;

        //Sí la puntuación no se encuentra entre 0 y 10 lanzo un error
        if(aspect1_points < 1 || aspect1_points > 10 || aspect2_points < 1 || aspect2_points > 10 || aspect3_points < 1 || aspect3_points > 10 || aspect4_points < 1 || aspect4_points > 10 || aspect5_points < 1 || aspect5_points > 10) {
            const error = new Error('La puntuación debe de estar entre 0 y 10');
            error.httpStatus = 400;
            throw(error);
        }
        //Compruebo si el usuario ya ha votado
        const [currentVotes] = await connection.query(`
            SELECT id FROM evaluation WHERE user_id=? AND company_aspects_id=?
        `, [id, company_aspects_id]);

        //Si ya ha votado devolvemos un error
        if(currentVotes.length >= 1) {
            const error = new Error('El usuario ya ha votado a esta empresa');
            error.httpStatus = 403;
            throw error;
        }

        //Si falta alguno de los campo obligatorios lanzo un Bad request
        if (!company_aspects_id || !id || !aspect1_points) {
            const error = new Error("Faltan campos obligatorios");
            error.httpStatus = 400;
            throw error;
        }

        //Ejecuto la inserción en la BBDD
        const now = new Date();

        await connection.query(`
            INSERT INTO evaluation (company_aspects_id, user_id, evaluation_date, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?);
        `, [company_aspects_id, id, now, aspect1_points, aspect2_points, aspect3_points, aspect4_points, aspect5_points]);

        const [results] = await connection.query(`
            SELECT SUM(aspect1_points + aspect2_points + aspect3_points + aspect4_points + aspect5_points) AS total
            FROM company_aspects
            INNER JOIN evaluation ON (company_aspects.id = evaluation.company_aspects_id)
            INNER JOIN company ON (company.id = company_aspects.company_id)
            WHERE user_id=? AND company_aspects_id=?
            `, [id, company_aspects_id]);

        //Calculo la ponderación en función de los años del usuario en la empresa
        const [startDate] = await connection.query(`
            SELECT starting_date 
            FROM user_company
            WHERE user_company.user_id=? AND user_company.company_id=?
        `, [id, company_aspects_id]);

        const [endDate] = await connection.query(`
            SELECT end_date 
            FROM user_company
            WHERE user_company.user_id=? AND user_company.company_id=?
        `, [id, company_aspects_id]);

        
        console.log(startDate[0].starting_date, endDate[0].end_date);

        let timeGap = endDate[0].end_date.getFullYear() - startDate[0].starting_date.getFullYear();
        console.log(results[0].total);

        let finalScore = Math.round(results[0].total * (1 + (timeGap * 0.1)));

        res.send({
            status: "ok",
            data: {
                company_aspects_id,
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