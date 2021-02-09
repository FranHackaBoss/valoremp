const getDB = require("../../db");

const getCompany = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        //Saco el id de los parámetros de ruta
        const { id } = req.params;
        
        //Hago la query
        const [result] = await connection.query(`
            SELECT company.signup_date, company.name, company.city, company.description, company.email
            FROM company
            WHERE company.id = ?
        `, [id]);
        
        //Desestructuro el elemento de los resultados
        const [single] = result;

        //Sacamos las fotos de la entrada
        const [photos] = await connection.query(`
            SELECT id, photo, uploadDate FROM company_photos WHERE company_id=?
        `, [id]);

        //Devuelvo un json con las entradas
        res.send({
            status: "ok",
            data: {
                single,
                photos,
            }
        });
    } catch (error) {
        //Lo mandamos al middleware de error
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = getCompany;