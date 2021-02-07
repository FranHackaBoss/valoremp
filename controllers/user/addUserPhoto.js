const getDB = require("../../db");
const { savePhoto, formatDateToDB } = require("../../helpers");

const addEntryPhoto = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;
        //Compruebo si el usuario ya ha subido una foto
        const [currentPhotos] = await connection.query(`
            SELECT id FROM user_photo WHERE user_id=?
        `, [id]);

        //Si ya hay una foto asociada al usuario devolvemos un error
        if(currentPhotos.length >= 1) {
            const error = new Error('Ya existe una foto para este usuario');
            error.httpStatus = 403;
            throw error;
        }

        let savedPhoto;

        if(req.files && req.files.photo) {
            //Guardo la foto en disco y saco el nombre con el que la guardé
            savedPhoto = await savePhoto(req.files.photo);
            
            //Meto  en la tabla user_photo una nueva entrada
            const now = new Date();
            await connection.query(`
                INSERT INTO user_photo(uploadDate, photo, user_id)
                VALUES (?, ?, ?)
            `, [formatDateToDB(now), savedPhoto, id]);
        }

        res.send({
            status: "ok",
            message: `Foto de usuario ${id} subida con exito`,
            data: {
                photo: savedPhoto,
            }
        })
    } catch(error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
}

module.exports = addEntryPhoto;