import mysql from 'mysql2/promise';

// https://sidorares.github.io/node-mysql2/docs/documentation

// Establish connection to mysql database
const db = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'company',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;