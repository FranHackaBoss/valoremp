const getDB = require("../../db");
const { formatDateToDB, saveImage} = require("../../helpers");

const newEntry = async (req, res, next) => {
    let connection;

    try {
        //Creo conexión a la BBDD
        connection = await getDB();

        //Saco los campos necesarios de req.body
        const { name, surname_1, surname_2, bio, city, email, username, password } = req.body;

        console.log(req.body);
        console.log(req.files);

        //Sí alguno de los campos obligatorios no existe lanzo un error Bad Request
        if (!name || !surname_1 || !surname_2 || !city || !email || !username || !password) {
            const error = new Error("Faltan campos obligatorios");
            error.httpStatus = 400;
            throw error;
        }

        //Ejecuto la inserción en la BBDD
        const [result] = await connection.query(`
            INSERT INTO user (name, surname_1, surname_2, bio, city, email, username, password)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?);
        `, [name, surname_1, surname_2, bio, city, email, username, password]);

        //Saco la id de la fila insertada
        const { insertId } = result;

        //Creo un objeto con la fecha actual
        const now = new Date();

        //Procesar las imágenes
        const photos = [];

        if(req.files && Object.keys(req.files).length > 0) {
            //Hay imagenes
            for (const photoData of Object.values(req.files).slice(0, 1)) {
                //Guardar la imagen y conseguir el nombre del fichero
                const photoFile = await saveImage(photoData);
                photos.push(photoFile);
                //Meter una nueva entrada en la tabla user_photos
                await connection.query(`
                    INSERT INTO user_photo(uploadDate, photo, user_id)
                    VALUES (?, ?, ?)
                `, [formatDateToDB(now), photoFile, insertId]);
            }
        }


        //Devuelvo el objeto que representa lo que acabo de insertar en la BBDD
        res.send({
            status: "ok",
            data: {
                id: insertId,
                name,
                surname_1,
                surname_2,
                bio,
                city,
                email,
                username,
                password,
                photos,
            }
    });
    } catch (error) {
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = newEntry;