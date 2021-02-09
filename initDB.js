require("dotenv").config();
const faker = require("faker");
const { random } = require("lodash");
const getDB = require("./db");
const { formatDateToDB } = require("./helpers");

let connection;

async function main() {
    try {
        connection = await getDB();

        await connection.query(`DROP TABLE IF EXISTS company_photos`);
        await connection.query(`DROP TABLE IF EXISTS evaluation`);
        await connection.query(`DROP TABLE IF EXISTS company_aspects`);
        await connection.query(`DROP TABLE IF EXISTS user_company`);
        await connection.query(`DROP TABLE IF EXISTS company`);
        await connection.query(`DROP TABLE IF EXISTS user`);


        //Creamos tabla company
        
        await connection.query(`
            CREATE TABLE company (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                signup_date DATETIME NOT NULL,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255),
                description TEXT,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(512) NOT NULL,
                logo VARCHAR(50)
            );
        `);

        //Creamos tabla user
        
        await connection.query(`
            CREATE TABLE user (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                signup_date DATETIME NOT NULL,
                name VARCHAR(128) NOT NULL,
                surname_1 VARCHAR(128) NOT NULL,
                surname_2 VARCHAR(128),
                bio VARCHAR(2048),
                city VARCHAR(128),
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(128) NOT NULL UNIQUE,
                password VARCHAR(512) NOT NULL,
                avatar VARCHAR(50),
                active BOOLEAN DEFAULT false,
                registrationCode VARCHAR(100),
                role ENUM("admin", "normal") DEFAULT "normal" NOT NULL
            );
        `);
        
    
        //Creamos tabla usuario-companía

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_company (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                work_position VARCHAR(255),
                starting_date DATE NOT NULL,
                end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                company_id BIGINT NOT NULL,
                aspect1 VARCHAR(2048),
                aspect2 VARCHAR(2048),
                aspect3 VARCHAR(2048),
                aspect4 VARCHAR(2048),
                aspect5 VARCHAR(2048),
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
            );
        `);

        //Creamos tabla evaluation
        
        await connection.query(`
            CREATE TABLE evaluation (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                company_aspects_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                evaluation_date DATETIME,
                aspect1_points TINYINT NOT NULL,
                aspect2_points TINYINT,
                aspect3_points TINYINT,
                aspect4_points TINYINT,
                aspect5_points TINYINT,
                text_review VARCHAR(2048),
                FOREIGN KEY (company_aspects_id)
                    REFERENCES company_aspects(id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id),
                CONSTRAINT evaluation_CK1 CHECK (aspect1_points >= 1 AND aspect1_points <= 10 AND aspect2_points >= 1 AND aspect2_points <= 10 AND aspect3_points >= 1 AND aspect3_points <= 10 AND aspect4_points >= 1 AND aspect4_points <= 10 AND aspect5_points >= 1 AND aspect5_points <= 10)
            );
        `);

        //Creamos tabla empresa-photos

        await connection.query(`
            CREATE TABLE company_photos (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                uploadDate DATETIME NOT NULL,
                photo VARCHAR(50) NOT NULL,
                company_id BIGINT NOT NULL,
                FOREIGN KEY (company_id)
                    REFERENCES company(id)
            );
        `);


        console.log('Tablas creadas');

        let users = 10;
        let companies = 10;
        let now = new Date();
        
        //Datos de prueba
        //Introducimos companies

        for (let i = 0; i < companies; i++) {
            const company = faker.company.companyName();
            const email = faker.internet.email();
            const password = faker.internet.password();

            await connection.query(`
                INSERT INTO company(signup_date, name, email, password)
                VALUES ('${formatDateToDB(now)}', '${company}', '${email}', SHA2('${password}', 512));
            `)
        }
        //Introducimos usuarios
        //introducimos un usuario administrador
        await connection.query(`
            INSERT INTO user (signup_date, name, surname_1, email, username, password, active, role)
            VALUES ('${formatDateToDB(now)}', 'Fran', 'Iglesias', 'fran@gmail.com', 'paquito', SHA2(${process.env.ADMIN_PASSWORD}, 512), true, 'admin');
        `);

        //Introducimo usuarios aleatorios
        for (let i = 0; i < users; i++) {
            const name = faker.name.firstName();
            const lastName = faker.name.lastName();
            const email = faker.internet.email();
            const username = faker.internet.userName();
            const password = faker.internet.password();

            await connection.query(`
                INSERT INTO user(signup_date, name, surname_1, email, username, password, active)
                VALUES ('${formatDateToDB(now)}', '${name}', '${lastName}', '${email}', '${username}', SHA2('${password}', 512), true);
            `);
        }


       //Introducimos usuario-companía

        for (let i = 0; i < users; i++) {

            await connection.query(`
                INSERT INTO user_company(company_id ,user_id ,work_position ,starting_date ,end_date)
                VALUES ('${random(1, 10)}', '${random(2, users+1)}', '${faker.name.jobTitle()}', '1990-09-01', '${formatDateToDB(now)}');
            `);
        }


        // Introducimos aspectos a valorar

        for (let i = 0; i < companies; i++) {
            await connection.query(`
                INSERT INTO company_aspects(company_id, aspect1, aspect2, aspect3, aspect4, aspect5)
                VALUES ('${random(1, 10)}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}', '${faker.random.word()}');
            `);
        }

        //Introducimos notas

        for (let i = 0; i < users; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO evaluation(user_id ,company_aspects_id, evaluation_date , aspect1_points, aspect2_points ,aspect3_points, aspect4_points, aspect5_points, text_review)
                VALUES ('${random(2,users+1)}', '${random(1, 10)}', '${formatDateToDB(now)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${random(1, 10)}', '${faker.random.words()}');
            `);
        }

        //Introducimos fotos empresa

        for (let i = 0; i < companies; i++) {
            const now = new Date();

            await connection.query(`
                INSERT INTO company_photos(uploadDate, photo, company_id)
                VALUES ('${formatDateToDB(now)}', '${faker.random.word()}', '${random(1, 10)}' );
            `);
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