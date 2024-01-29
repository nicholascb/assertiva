const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQLDB_HOST,
  user: process.env.MYSQLDB_USER,
  password: process.env.MYSQLDB_ROOT_PASSWORD,
  database: process.env.MYSQLDB_DATABASE,
});

module.exports = {
  connection,
};
