const mysql = require('mysql2')

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb'
})

module.exports = connection.promise();