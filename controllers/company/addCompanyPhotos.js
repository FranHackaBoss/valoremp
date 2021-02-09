const getDB = require("../../db");
const { savePhoto, formatDateToDB } = require("../../helpers");

const addCompanyPhotos = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { id } = req.params;
        //Compruebo si el empresa ya ha subido fotos
        const [currentPhotos] = await connection.query(`
            SELECT id FROM company_photos WHERE company_id=?
        `, [id]);

        //Si ya hay una foto asociada al usuario devolvemos un error
        if(currentPhotos.length >= 10) {
            const error = new Error('Solo puede compartir un máximo de 10 fotos');
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
                INSERT INTO company_photos(uploadDate, photo, company_id)
                VALUES (?, ?, ?)
            `, [formatDateToDB(now), savedPhoto, id]);
        }

        res.send({
            status: "ok",
            message: `Foto subida con exito`,
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

module.exports = addCompanyPhotos;