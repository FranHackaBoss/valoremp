const faker = require("faker");
const { random } = require("lodash");
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
                id BIGINT NOT NULL AUTO_INCREMENT,
                name VARCHAR(256) NOT NULL,
                description VARCHAR(2048),
                logo VARCHAR(256),
                email VARCHAR(256) NOT NULL,
                city VARCHAR(256),
                PRIMARY KEY (id)
            );
        `);

        //Creamos tabla user
        
        await connection.query(`
            CREATE TABLE user (
                id BIGINT NOT NULL AUTO_INCREMENT,
                name VARCHAR(128) NOT NULL,
                surname_1 VARCHAR(128) NOT NULL,
                surname_2 VARCHAR(128) NOT NULL,
                bio VARCHAR(2048),
                photo VARCHAR(256),
                city VARCHAR(128),
                email VARCHAR(256) NOT NULL UNIQUE,
                username VARCHAR(128) NOT NULL UNIQUE,
                password VARCHAR(256) NOT NULL,
                PRIMARY KEY (id)
            );
        `);
        
        //Creamos tabla usuario-sesión

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_session (
                id BIGINT NOT NULL AUTO_INCREMENT,
                user_id BIGINT NOT NULL,
                session_id BIGINT NOT NULL,
                login_mode ENUM('USERNAME', 'EMAIL'),
                login VARCHAR(256),
                PRIMARY KEY(id),
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
                work_position VARCHAR(255),
                starting_date DATE NOT NULL,
                end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE,
                CONSTRAINT user_company CHECK (starting_date < end_date)
            );
        `);

        //Creamos tabla company_aspects
        
        await connection.query(`
            CREATE TABLE company_aspects (
                id BIGINT NOT NULL AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                aspect1 VARCHAR(2048),
                aspect2 VARCHAR(2048),
                aspect3 VARCHAR(2048),
                aspect4 VARCHAR(2048),
                aspect5 VARCHAR(2048),
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
                    ON DELETE CASCADE
            );
        `);

        //Creamos tabla evaluation
        
        await connection.query(`
            CREATE TABLE evaluation (
                id BIGINT NOT NULL AUTO_INCREMENT,
                user_id BIGINT NOT NULL,
                company_id BIGINT NOT NULL,
                company_aspects_id BIGINT NOT NULL,
                evaluation_date DATETIME,
                aspect1_points TINYINT,
                aspect2_points TINYINT,
                aspect3_points TINYINT,
                aspect4_points TINYINT,
                aspect5_points TINYINT,
                text_review VARCHAR(2048),
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
                VALUES ('${faker.name.firstName()}', '${faker.name.middleName()}', '${faker.name.lastName()}', '${faker.name.jobDescriptor()}', '${faker.random.word()}', '${faker.address.city()}', '${faker.internet.email()}', '${faker.internet.userName()}', '${faker.random.word()}');
            `)
        }

        // Introducimos aspectos a valorar

        for (let i = 0; i < entries; i++) {
            await connection.query(`
                INSERT INTO company_aspects(company_id, aspect1, aspect2, aspect3, aspect4, aspect5)
                VALUES ('${random(1, 10)}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}');
            `)
        }

        //Introducimos notas

        for (let i = 0; i < entries; i++) {
            const now = new Date();
            await connection.query(`
                INSERT INTO evaluation(user_id ,company_id ,company_aspects_id, evaluation_date , aspect1_points, aspect2_points ,aspect3_points, aspect4_points, aspect5_points, text_review)
                VALUES ('${random(1,10)}', '${random(1, 10)}', '${random(1, 10)}', '${formatDateToDB(now)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${faker.random.words()}');
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