const getDB = require("../../db");
const listUsers = async (req, res, next) => {
    let connection;
    
    try {
        connection = await getDB();

        //Saco querystring                                                          
        const { search, order, direction } = req.query;

        const validOrderFields = ['id', 'name', 'surname_1', 'surname_2', 'city', 'email', 'username'];
        const validOrderDirection = ['DESC', 'ASC'];

        const orderBy = validOrderFields.includes(order) ? order : 'id';
        const orderDirection = validOrderDirection.includes(direction) ? direction : 'ASC';

        let results;

        if (search) {
          [results] = await connection.query(`
            SELECT user.signup_date, user.id, user.name, user.surname_1, user.surname_2, user.bio, user.city, user.email, user.username, user.password
            FROM user
            WHERE user.city LIKE ? OR user.surname_1 LIKE ?
            GROUP BY user.signup_date, user.id, user.name, user.surname_1, user.surname_2, user.bio, user.city, user.email, user.username, user.password
            ORDER BY ${orderBy} ${orderDirection};
            `, [`%${search}%`, `%${search}%`]);
        } else {
           //Leo las entradas de la tabla user
           [results] = await connection.query(`
            SELECT user.signup_date, user.id, user.name, user.surname_1, user.surname_2, user.bio, user.city, user.email, user.username, user.password
            FROM user 
            GROUP BY user.signup_date, user.id, user.name, user.surname_1, user.surname_2, user.bio, user.city, user.email, user.username, user.password
            ORDER BY ${orderBy} ${orderDirection};
           `,);
        }

        //Saco las id's de los resultados
        const ids = results.map((result) => result.id);

        //Selecciono todas las fotos que estén relacionadas con una id de results
        const [photos] = await connection.query(`
            SELECT * FROM user_photo WHERE user_id IN (${ids.join(',')})
        `);

        //Unimos el array de fotos resultante de la query anterior con los results
        const resultsWithPhotos = results.map(result => {
            //Fotos correspondiente al resultado (sí las hay de lo contrario devolverá un array vacío)
            const resultPhotos = photos.filter(photo => photo.user_id === result.id);

            return {
                ...result,
                photos: resultPhotos
            };
        });

        //Devuelvo un json con el resultado + array de fotos
        res.send({
            status: "ok",
            data: resultsWithPhotos,
        });
    } catch (error) {
        //Lo mandamos al middleware de error
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = listUsers;