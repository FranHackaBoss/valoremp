const faker = require("faker");
const { random } = require("lodash");
const getDB = require("./db");
const { formatDateToDB } = require("./helpers");

let connection;

async function main() {
    try {
        connection = await getDB();

        await connection.query(`DROP TABLE IF EXISTS user_photo`);
        await connection.query(`DROP TABLE IF EXISTS company_logo`);
        await connection.query(`DROP TABLE IF EXISTS evaluation`);
        await connection.query(`DROP TABLE IF EXISTS company_aspects`);
        await connection.query(`DROP TABLE IF EXISTS user_company`);
        await connection.query(`DROP TABLE IF EXISTS company`);
        await connection.query(`DROP TABLE IF EXISTS user`);


        //Creamos tabla company
        
        await connection.query(`
            CREATE TABLE company (
                id BIGINT AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                email VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
            );
        `);

        //Creamos tabla user
        
        await connection.query(`
            CREATE TABLE user (
                id BIGINT AUTO_INCREMENT,
                name VARCHAR(128) NOT NULL,
                surname_1 VARCHAR(128) NOT NULL,
                surname_2 VARCHAR(128) NOT NULL,
                bio VARCHAR(2048),
                city VARCHAR(128) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(128) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
            );
        `);
        
    
        //Creamos tabla usuario-companía

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_company (
                id BIGINT AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                work_position VARCHAR(255),
                starting_date DATE NOT NULL,
                end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id),
                CONSTRAINT user_company CHECK (starting_date < end_date)
            );
        `);

        //Creamos tabla company_aspects
        
        await connection.query(`
            CREATE TABLE company_aspects (
                id BIGINT AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                aspect1 VARCHAR(2048),
                aspect2 VARCHAR(2048),
                aspect3 VARCHAR(2048),
                aspect4 VARCHAR(2048),
                aspect5 VARCHAR(2048),
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
            );
        `);

        //Creamos tabla evaluation
        
        await connection.query(`
            CREATE TABLE evaluation (
                id BIGINT AUTO_INCREMENT,
                company_aspects_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                evaluation_date DATETIME,
                aspect1_points TINYINT NOT NULL,
                aspect2_points TINYINT,
                aspect3_points TINYINT,
                aspect4_points TINYINT,
                aspect5_points TINYINT,
                text_review VARCHAR(2048),
                PRIMARY KEY (id),
                FOREIGN KEY (company_aspects_id)
                    REFERENCES company_aspects(id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id),
                CONSTRAINT evaluation_CK1 CHECK (aspect1_points >= 1 AND aspect1_points <= 10 AND aspect2_points >= 1 AND aspect2_points <= 10 AND aspect3_points >= 1 AND aspect3_points <= 10 AND aspect4_points >= 1 AND aspect4_points <= 10 AND aspect5_points >= 1 AND aspect5_points <= 10)
            );
        `);

        //Creamos tabla usuario-fotos

        await connection.query(`
            CREATE TABLE user_photo (
                id BIGINT AUTO_INCREMENT,
                uploadDate DATETIME NOT NULL,
                photo VARCHAR(50) NOT NULL,
                user_id BIGINT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
            );
        `);

        //Creamos tabla empresa-logo

        await connection.query(`
            CREATE TABLE company_logo (
                id BIGINT AUTO_INCREMENT,
                uploadDate DATETIME NOT NULL,
                logo VARCHAR(50) NOT NULL,
                company_id BIGINT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
            );
        `);


        console.log('Tablas creadas');

        const users = 25;
        const companies = 10;
        //Introducimos companies

        for (let i = 0; i < companies; i++) {
            await connection.query(`
                INSERT INTO company(name, description, email, city)
                VALUES ('${faker.company.companyName()}','${faker.random.word()}', '${faker.internet.email()}', '${faker.address.city()}');
            `)
        }

        //Introducimos usuarios

        for (let i = 0; i < users; i++) {
            await connection.query(`
                INSERT INTO user(name, surname_1, surname_2, bio, city, email, username, password)
                VALUES ('${faker.name.firstName()}', '${faker.name.middleName()}', '${faker.name.lastName()}', '${faker.name.jobDescriptor()}', '${faker.address.city()}', '${faker.internet.email()}', '${faker.internet.userName()}', '${faker.random.word()}');
            `)
        }


        //Introducimos usuario-companía

        for (let i = 0; i < users; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO user_company(company_id ,user_id ,work_position ,starting_date ,end_date)
                VALUES ('${random(1, 10)}', '${random(1, 10)}', '${faker.name.jobTitle()}', '1990-09-01', '${formatDateToDB(now)}');
            `)
        }


        // Introducimos aspectos a valorar

        for (let i = 0; i < companies; i++) {
            await connection.query(`
                INSERT INTO company_aspects(company_id, aspect1, aspect2, aspect3, aspect4, aspect5)
                VALUES ('${random(1, 10)}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}');
            `)
        }

        //Introducimos notas

        for (let i = 0; i < users; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO evaluation(user_id ,company_aspects_id, evaluation_date , aspect1_points, aspect2_points ,aspect3_points, aspect4_points, aspect5_points, text_review)
                VALUES ('${random(1,10)}', '${random(1, 10)}', '${formatDateToDB(now)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${faker.random.words()}');
            `)
        }

        //Introducimos fotos usuario

        for (let i = 0; i < users; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO user_photo(uploadDate, photo, user_id)
                VALUES ('${formatDateToDB(now)}', '${faker.random.word()}', '${random(1, 10)}' );
            `)
        }

        //Introducimos logo empresa

        for (let i = 0; i < companies; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO company_logo(uploadDate, logo, company_id)
                VALUES ('${formatDateToDB(now)}', '${faker.random.word()}', '${random(1, 10)}' );
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