const getDB = require("../../db");
const { savePhoto, formatDateToDB } = require("../../helpers");

const addCompanyPhotos = async (req, res, next) => {
  let connection;

  try {
    connection = await getDB();

    const { id } = req.params;

    // Miro cuantas fotos tiene la empresa actualmente
    const [currentPhotos] = await connection.query(
      `
      SELECT id FROM company_photos WHERE company_id=?
    `,
      [id]
    );
    console.log(currentPhotos);
    // Si tiene 10 o más fotos devuelvo un error
    if (currentPhotos.length >= 10) {
      const error = new Error(
        "Puede subir un máximo de 10 fotos"
      );
      error.httpStatus = 403;
      throw error;
    }

    let savedPhoto;

    if (req.files && req.files.photo) {
      // guardo la foto en disco y saco el nombre con el que la guardé
      savedPhoto = await savePhoto(req.files.photo);

      const now = new Date();
      // Meto en la tabla de entries_photos una nueva entrada
      await connection.query(
        `
      INSERT INTO company_photos(uploadDate, photo, company_id)
      VALUES (?, ?, ?)
      `,
        [formatDateToDB(now), savedPhoto, id]
      );
    }

    res.send({
      status: "ok",
      data: {
        photo: savedPhoto,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = addCompanyPhotos;