const getDB = require("../../db");

const addUserComp = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { company_id, id } = req.params;

        //Compruebo si el usuario ya está relacionado con la empresa
        const [currentRelation] = await connection.query(`
            SELECT id FROM user_company WHERE user_id=? AND company_id=?
        `, [id, company_id]);
        
        //Si ya hay una relación usuario-empresa devolvemos un error
        if(currentRelation.length > 0) {
            const error = new Error('Ya existe una relación para este usuario y esta empresa');
            error.httpStatus = 403;
            throw error;
        }

        //Saco los campos necesarios de req.body
        let { work_position, starting_date, end_date } = req.body;

        //Sí alguno de los campos obligatorios no existe lanzo un error Bad Request
        if (!work_position || !starting_date) {
            const error = new Error("Faltan campos obligatorios");
            error.httpStatus = 400;
            throw error;
        }

        //Ejecuto la inserción en la BBDD
        if (!end_date) {
            const now = new Date();
            end_date = now;
        }
        await connection.query(`
            INSERT INTO user_company (company_id, user_id, work_position, starting_date, end_date)
            VALUES(?, ?, ?, ?, ?);
        `, [company_id, id, work_position, starting_date, end_date]);

        res.send({
            status: "ok",
            message: 'Nueva relación añadida',
            data: {
                company_id,
                id,
                work_position,
                starting_date,
                end_date
            }
        })
    } catch(error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = addUserComp;