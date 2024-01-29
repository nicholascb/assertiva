const express = require("express");
const { connection } = require("../lib/db");
const router = express.Router();

router.get("/ddd/:ddd", (req, res) => {
  const ddd = req.params.ddd;

  const sql = `
          SELECT u.id AS userId, u.name, u.cpf, p.ddd, GROUP_CONCAT(p.phone_number) AS phone_numbers
          FROM users AS u
          JOIN phones AS p ON u.id = p.user_id
          WHERE p.ddd = ?
          GROUP BY u.id, u.name, u.cpf, p.ddd
      `;
  const values = [ddd];

  connection.query(sql, values, (err, results) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    const sanitizedResults = results.map((checkUser) => {
      return {
        userId: checkUser.userId,
        name: checkUser.name,
        cpf: checkUser.cpf,
        phones: [
          {
            ddd: checkUser.ddd,
            phoneNumbers: checkUser.phone_numbers.split(","),
          },
        ],
      };
    });

    return res.status(200).json(sanitizedResults);
  });
});

router.get("/name/:name", (req, res) => {
  const name = "%" + req.params.name + "%";

  const sql = `
    SELECT u.id AS userId, u.name, u.cpf
    FROM users AS u
    WHERE u.name LIKE ?
  `;
  const values = [name];

  connection.query(sql, values, (err, results) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    const sanitizedResults = results.map((checkUser) => {
      return {
        userId: checkUser.userId,
        name: checkUser.name,
        cpf: checkUser.cpf,
      };
    });

    return res.status(200).json(sanitizedResults);
  });
});

module.exports = router;
