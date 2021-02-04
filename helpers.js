const { format } = require("date-fns");
const sharp = require("sharp");
const uuid = require("uuid");
const path = require("path");
const { ensureDir } = require("fs-extra");

 const { UPLOADS_DIRECTORY } = process.env;
 const uploadsDir = path.join(__dirname, UPLOADS_DIRECTORY);

function formatDateToDB (dateObject) {
    return format(dateObject, 'yyyy-MM-dd HH:mm:ss');
}


async function saveImage(imageData) {
    
    //imageData es el objeto con información de la imagen
    //Asegurarse que el directorio de subida de imagenes exista
    await ensureDir(uploadsDir);

    //Leer la imagen con sharp
    const image = sharp(imageData.data);

    //Comprobar que la imagen no tenga un tamaño mayor a x pixeles de ancho
    const imageInfo = await image.metadata();

    //Si es mayor que ese tamaño redimensionarla a ese tamaño
    const IMAGE_MAX_WIDTH = 1000;
    if (imageInfo.width > IMAGE_MAX_WIDTH) {
        image.resize(IMAGE_MAX_WIDTH);
    }

    //Generar un nombre único para la imagen
    const savedImageName = `${uuid.v4()}.jpg`;

    //Guardar la imagen en el directorio de subida de imagenes
    await image.toFile(path.join(uploadsDir, savedImageName));
    
    //Devolver el nombre del fichero
    return savedImageName;
    }

module.exports = { formatDateToDB, saveImage };