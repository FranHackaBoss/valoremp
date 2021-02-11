const getDB = require("../../db");

const editUser = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;

        //Compruebo que el id del usuario que queremos modificar se corresponde con el token o es administrador
        if(+id !== req.auth.id && req.auth.role !== 'admin') {
            const error = new Error('El token no es válido');
            error.httpStatus = 401;
            throw error;
        }
        
        //Comprobar que los datos mínimos vienen en el body
        const { name, surname_1, surname_2, bio, city, dni, email } = req.body;

        if (!name || !surname_1 || !email ) {
            const error = new Error('Faltan campos');
            error.httpStatus = 400;
            throw error;
        }
        //Hacer la query de SQL
        await connection.query(`
            UPDATE IGNORE user SET name=?, surname_1=?, surname_2=?, bio=?, city=?, dni=?, email=? WHERE id=?
        `, [name, surname_1, surname_2, bio, city, dni, email, id]);
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
                dni,
                email,
            }
        })
    } catch (error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
}

module.exports = editUser;