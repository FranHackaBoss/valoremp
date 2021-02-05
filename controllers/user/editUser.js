const getDB = require("../../db");

const editUser = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;

        //Comprobamos que existe una entrada con ese id
        const [current,] = await connection.query(`
            SELECT id FROM user WHERE id=?
        `, [id]);

        //Si no existe devolver un 404
        if (current.length === 0) {
            const error = new Error('No existe ninguna entrada en la base de datos con ese id');
            error.httpStatus = 404;
            throw error;
        }

        //Comprobar que los datos mínimos vienen en el body
        const { name, surname_1, surname_2, bio, city, email, username, password } = req.body;

        if (!name || !surname_1 || !surname_2 || !city || !email || !username || !password) {
            const error = new Error('Faltan campos');
            error.httpStatus = 400;
            throw error;
        }
        //Hacer la query de SQL
        await connection.query(`
            UPDATE user SET name=?, surname_1=?, surname_2=?, bio=?, city=?, email=?, username=?, password=? WHERE id=?
        `, [name, surname_1, surname_2, bio, city, email, username, password, id]);
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
                username,
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