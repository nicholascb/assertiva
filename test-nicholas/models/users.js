const { connection } = require("../lib/db");

function checkIfCpfExists(cpf) {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM users WHERE cpf = ?";
    connection.query(query, [cpf], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
}

function checkIfCpfExistswithId(cpf, userId) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT COUNT(*) AS count FROM users WHERE cpf = ? and id != ?";
    connection.query(query, [cpf, userId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
}
module.exports = { checkIfCpfExists, checkIfCpfExistswithId };
