const getDB = require("../../db");

const editUser = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;

        //Comprobar que los datos mínimos vienen en el body
        const { name, surname_1, surname_2, bio, city, email, password } = req.body;

        if (!name || !surname_1 || !email || !password) {
            const error = new Error('Faltan campos');
            error.httpStatus = 400;
            throw error;
        }
        //Hacer la query de SQL
        await connection.query(`
            UPDATE user SET name=?, surname_1=?, surname_2=?, bio=?, city=?, email=?, password=? WHERE id=?
        `, [name, surname_1, surname_2, bio, city, email, password, id]);
        //Devolver una respuesta

        res.send ({
            status: "ok",
            data: {
                id,
                name,
                surname_1,
                surname_2,
                bio,
                city,
                email,
                password,
            }
        })
    } catch (error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = editUser;