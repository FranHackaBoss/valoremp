const faker = require("faker");
const lodash = require("lodash");
const getDB = require("./db");
const { formatDateToDB } = require("./helpers");

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

        //Creamos tabla company
        
        await connection.query(`
            CREATE TABLE company (
                id BIGINT AUTO_INCREMENT,
                name VARCHAR(128) NOT NULL,
                description VARCHAR(2048),
                logo VARCHAR(256),
                email VARCHAR(256) NOT NULL,
                city VARCHAR(128),
                PRIMARY KEY (id)
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
                photo VARCHAR(256),
                city VARCHAR(128),
                email VARCHAR(256) NOT NULL UNIQUE,
                username VARCHAR(128) NOT NULL UNIQUE,
                password VARCHAR(512) NOT NULL,
                PRIMARY KEY (id)
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
                id BIGINT AUTO_INCREMENT,
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
                evaluation_date DATETIME NOT NULL,
                starting_date DATE NOT NULL,
                end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                company_aspects_id BIGINT UNIQUE,
                aspect1_points TINYINT NOT NULL,
                aspect2_points TINYINT NOT NULL,
                aspect3_points TINYINT NOT NULL,
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
                CONSTRAINT evaluation CHECK ((starting_date < end_date) AND (aspect1_points >= 0 AND aspect1_points <= 10) AND (aspect2_points >= 0 AND aspect2_points <= 10) AND (aspect3_points >= 0 AND aspect3_points <= 10))
            );
        `);


        console.log('Tablas creadas');

        //Introducir datos de prueba


        //Introducimos sesiones
        const entries = 10;

        for (let i = 0; i < entries; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO session(device, connection_date)
                VALUES ('DESKTOP', '${formatDateToDB(now)}');
            `)
        }
        
        //Introducimos companies

        for (let i = 0; i < entries; i++) {
            await connection.query(`
                INSERT INTO company(name, description, logo, email, city)
                VALUES ('${faker.company.companyName()}','${faker.company.catchPhraseDescriptor()}', '${faker.random.word()}', '${faker.internet.email()}', '${faker.address.city()}');
            `)
        }

        //Introducimos usuarios

        for (let i = 0; i < entries; i++) {
            await connection.query(`
                INSERT INTO user(name, surname_1, surname_2, bio, photo, city, email, username, password)
                VALUES ('${faker.name.firstName()}', '${faker.name.lastName()}', '${faker.name.lastName()}', '${faker.name.jobDescriptor()}', '${faker.random.word()}', '${faker.address.city()}', '${faker.internet.email()}', '${faker.internet.userName()}', '${faker.internet.password()}');
            `)
        }

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