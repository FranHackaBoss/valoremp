const getDB = require("./db");

let connection;

async function main() {
    try {
        connection = await getDB();

        await connection.query(`DROP TABLE IF EXISTS session`);
        await connection.query(`DROP TABLE IF EXISTS company`);
        await connection.query(`DROP TABLE IF EXISTS user`);
        await connection.query(`DROP TABLE IF EXISTS user_session`);
        await connection.query(`DROP TABLE IF EXISTS user_company`);
        await connection.query(`DROP TABLE IF EXISTS company_aspects`);
        await connection.query(`DROP TABLE IF EXISTS evaluation`);
        await connection.query(`DROP TABLE IF EXISTS ressource_image_data`);


        //Creamos tabla sesión

        await connection.query(`
            CREATE TABLE IF NOT EXISTS session (
                id BIGINT NOT NULL AUTO_INCREMENT,
                device ENUM ('DESKTOP', 'MOBILE', 'ANDROID', 'IOS') NOT NULL,
                connection_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );
        `)

        //Creamos tabla fotos

        await connection.query(`
            CREATE TABLE ressource_image_data (
                id INT AUTO_INCREMENT,
                image_width INT NOT NULL,
                image_height INT NOT NULL,
                PRIMARY KEY (id)
            );
        `)

        //Creamos tabla company
        
        await connection.query(`
            CREATE TABLE company (
                id BIGINT AUTO_INCREMENT,
                name VARCHAR(128) NOT NULL,
                description VARCHAR(2048),
                email VARCHAR(256) NOT NULL,
                computed_score FLOAT,
                city VARCHAR(128),
                logo_id INT UNIQUE,
                PRIMARY KEY (id),
                FOREIGN KEY (logo_id)
                    REFERENCES ressource_image_data(id)
                    ON DELETE CASCADE
            );
        `);

        //Creamos tabla user
        
        await connection.query(`
            CREATE TABLE user (
                id BIGINT AUTO_INCREMENT,
                name VARCHAR(169) NOT NULL,
                surname_1 VARCHAR(128) NOT NULL,
                surname_2 VARCHAR(128) NOT NULL,
                bio VARCHAR(2048),
                city VARCHAR(128),
                email VARCHAR(256) NOT NULL UNIQUE,
                username VARCHAR(128) NOT NULL UNIQUE,
                password VARCHAR(512) NOT NULL,
                photo_id INT UNIQUE,
                PRIMARY KEY (id),
                FOREIGN KEY (photo_id)
                    REFERENCES ressource_image_data(id)
                    ON DELETE CASCADE
            );
        `);
        

        //Creamos tabla usuario-sesión

        await connection.query(`
            CREATE TABLE user_session (
                user_id BIGINT NOT NULL,
                session_id BIGINT NOT NULL,
                login_mode ENUM('USERNAME', 'EMAIL') NOT NULL,
                login VARCHAR(256) NOT NULL,
                PRIMARY KEY(user_id, session_id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (session_id)
                    REFERENCES session(id)
                    ON DELETE CASCADE
            );
        `);


        //Creamos tabla usuario-companía
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_company (
                id BIGINT NOT NULL AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                erd_work_position VARCHAR(255) NULL,
                erd_start_date TIMESTAMP NULL,
                erd_end_date TIMESTAMP NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            );
        `)


        //Creamos tabla company_aspects
        
        await connection.query(`
            CREATE TABLE company_aspects (
                id BIGINT AUTO_INCREMENT UNIQUE NOT NULL,
                company_id BIGINT NOT NULL,
                aspect1_id BIGINT NOT NULL,
                aspect2_id BIGINT NOT NULL,
                aspect3_id BIGINT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
                    ON DELETE CASCADE
            );
        `);

        //Creamos tabla evaluation
        
        await connection.query(`
            CREATE TABLE evaluation (
                id BIGINT UNIQUE NOT NULL,
                user_id BIGINT,
                company_id BIGINT,
                company_aspects_id BIGINT UNIQUE,
                aspect1_points TINYINT NOT NULL,
                aspect2_points TINYINT NOT NULL,
                aspect3_points TINYINT NOT NULL,
                evaluation_date DATETIME NOT NULL,
                text_review VARCHAR(2048) NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (company_aspects_id)
                    REFERENCES company_aspects(id)
                    ON DELETE CASCADE,
                CONSTRAINT evaluation CHECK ((aspect1_points >= 0 AND aspect1_points <= 10) AND (aspect2_points >= 0 AND aspect2_points <= 10) AND (aspect3_points >= 0 AND aspect3_points <= 10))
            );
        `);


        console.log('Tablas creadas');
    } catch(error) {
        console.error(error);
        } finally {
            if (connection) {
                connection.release();
                // eslint-disable-next-line no-undef
                process.exit();
            }
        }
}

main();