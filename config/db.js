require('dotenv').config();
const mysql = require("mysql2/promise");

let connection;

async function getConnection() {
    if(!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Connected to MySQL database: ', process.env.DB_NAME);
    }
    return connection;
}

module.exports = getConnection;