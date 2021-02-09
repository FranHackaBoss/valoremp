const getDB = require("../../db");

const editCompany = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;

        //Comprobar que los datos mínimos vienen en el body
        const { name, city, description, email } = req.body;

        if (!name || !email) {
            const error = new Error('Faltan campos');
            error.httpStatus = 400;
            throw error;
        }
        //Hacer la query de SQL
        await connection.query(`
            UPDATE company SET name=?, city=?, description=?, email=? WHERE id=?
        `, [name, city, description, email, id]);
        //Devolver una respuesta

        res.send ({
            status: "ok",
            data: {
                id,
                name,
                city,
                description,
                email
            }
        })
    } catch (error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = editCompany;