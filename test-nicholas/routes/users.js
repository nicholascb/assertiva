const express = require("express");

const { validateCPF, validateCPFFormat } = require("../lib/cpf");
const { connection } = require("../lib/db");
const { checkIfCpfExists, checkIfCpfExistswithId } = require("../models/users");
const {
  validatePhones,
  validateEmail,
  checkDuplicateEmails,
  checkDuplicateDDDPhones,
} = require("../lib/utils");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, cpf, phones, emails } = req.body;
  if (!name || !cpf)
    return res.status(400).json({ result: "Name and CPF are required" });
  if (name.length < 3)
    return res
      .status(400)
      .json({ result: "Name must contain at least 3 characters" });
  if (!validateCPFFormat(cpf))
    return res.status(400).json({ result: "CPF must contain only numbers" });
  if (!validateCPF(cpf)) return res.status(400).json({ result: "Invalid CPF" });
  if (!phones || phones.length < 1)
    return res.status(400).json({ result: "At least one phone is required" });
  if (!emails || emails.length < 1)
    return res.status(400).json({ result: "At least one email is required" });
  const invalidEmails = validateEmail(emails);
  if (invalidEmails.length > 0)
    return res.status(400).json({ result: "Invalid emails: ", invalidEmails });
  const invalidPhones = validatePhones(phones);
  if (invalidPhones.length > 0)
    return res.status(400).json({ result: "Invalid phones: ", invalidPhones });
  const duplicateEmails = checkDuplicateEmails(emails);
  if (duplicateEmails)
    return res.status(400).json({ result: "Duplicate emails" });
  const duplicateDDDPhones = checkDuplicateDDDPhones(phones);
  if (duplicateDDDPhones)
    return res.status(400).json({ result: "Duplicate phones" });
  const cpfExists = await checkIfCpfExists(cpf);
  if (cpfExists) return res.status(400).json({ result: "CPF already exists" });

  const userSql = "INSERT INTO users (name, cpf) VALUES (?, ?)";
  const userValues = [name, cpf];

  connection.query(userSql, userValues, (err, result) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    const userId = result.insertId;
    const phoneSql = "INSERT INTO phones (user_id, ddd, phone_number) VALUES ?";
    const emailSql = "INSERT INTO emails (user_id, email_address) VALUES ?";
    const phoneValues = phones.map((phone) => [
      userId,
      phone.ddd,
      phone.phoneNumber,
    ]);
    const emailValues = emails.map((email) => [userId, email]);

    connection.query(phoneSql, [phoneValues], (err) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      connection.query(emailSql, [emailValues], (err) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        return res.status(201).json({ userId });
      });
    });
  });
});

router.post("/:id/phone", (req, res) => {
  const userId = req.params.id;
  const { ddd, phoneNumber } = req.body;
  if (!ddd || !phoneNumber)
    return res
      .status(400)
      .json({ result: "DDD and phone number are required" });
  const invalidPhones = validatePhones([{ ddd, phoneNumber }]);
  if (invalidPhones.length > 0)
    return res.status(400).json({ result: "Invalid phones: ", invalidPhones });
  const checkUserSql = "SELECT * FROM users WHERE id = ?";
  const checkUserValues = [userId];

  connection.query(checkUserSql, checkUserValues, (err, userResult) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    if (userResult.length === 0) {
      return res.status(400).json({ result: "User does not exist" });
    }

    const checkDuplicatePhoneSql =
      "SELECT * FROM phones WHERE user_id = ? AND ddd = ? AND phone_number = ?";
    const checkDuplicatePhoneValues = [userId, ddd, phoneNumber];

    connection.query(
      checkDuplicatePhoneSql,
      checkDuplicatePhoneValues,
      (err, result) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        if (result.length > 0) {
          return res
            .status(400)
            .json({ result: "Phone already exists for this user" });
        }

        const addPhoneSql =
          "INSERT INTO phones (user_id, ddd, phone_number) VALUES (?, ?, ?)";
        const addPhoneValues = [userId, ddd, phoneNumber];

        connection.query(addPhoneSql, addPhoneValues, (err) => {
          if (err) {
            return res.status(400).json({ result: err });
          }

          return res.status(201).json({ result: "Phone added successfully" });
        });
      }
    );
  });
});

router.post("/:id/email", (req, res) => {
  const userId = req.params.id;
  const { email } = req.body;
  if (!email) return res.status(400).json({ result: "Email is required" });
  const invalidEmail = validateEmail([email]);
  if (invalidEmail.length > 0)
    return res.status(400).json({ result: "Invalid emails: ", invalidEmail });

  const checkUserSql = "SELECT id FROM users WHERE id = ?";
  const checkUserValues = [userId];

  connection.query(checkUserSql, checkUserValues, (err, result) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ result: "User not found" });
    }

    const checkDuplicateEmailSql =
      "SELECT email_address FROM emails WHERE user_id = ? AND email_address = ?";
    const checkDuplicateEmailValues = [userId, email];

    connection.query(
      checkDuplicateEmailSql,
      checkDuplicateEmailValues,
      (err, result) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        if (result.length > 0) {
          return res
            .status(400)
            .json({ result: "Email already exists for this user" });
        }

        const addEmailSql =
          "INSERT INTO emails (user_id, email_address) VALUES (?, ?)";
        const addEmailValues = [userId, email];

        connection.query(addEmailSql, addEmailValues, (err) => {
          if (err) {
            return res.status(400).json({ result: err });
          }

          return res.status(201).json({ result: "Email added successfully" });
        });
      }
    );
  });
});

router.delete("/:id/phone", (req, res) => {
  const userId = req.params.id;
  const { ddd, phoneNumber } = req.body;
  if (!ddd || !phoneNumber)
    return res.status(400).json({ result: "DDD and phoneNumber are required" });

  const deletePhoneSql =
    "DELETE FROM phones WHERE user_id = ? AND ddd = ? AND phone_number = ?";
  const deletePhoneValues = [userId, ddd, phoneNumber];

  // Check if there is only 1 phone
  const countPhonesSql =
    "SELECT COUNT(*) AS phoneCount FROM phones WHERE user_id = ?";
  const countPhonesValues = [userId];

  connection.query(countPhonesSql, countPhonesValues, (err, countResult) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    const phoneCount = countResult[0].phoneCount;

    if (phoneCount === 1) {
      return res
        .status(400)
        .json({ result: "Cannot delete the only phone for this user" });
    }

    connection.query(deletePhoneSql, deletePhoneValues, (err, result) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ result: "Phone not found for this user" });
      }

      return res.status(200).json({ result: "Phone deleted successfully" });
    });
  });
});

router.delete("/:id/email", (req, res) => {
  const userId = req.params.id;
  const { email } = req.body;
  if (!email) return res.status(400).json({ result: "Email is required" });
  const deleteEmailSql =
    "DELETE FROM emails WHERE user_id = ? AND email_address = ?";
  const deleteEmailValues = [userId, email];

  const countEmailsSql =
    "SELECT COUNT(*) AS emailCount FROM emails WHERE user_id = ?";
  const countEmailsValues = [userId];

  connection.query(countEmailsSql, countEmailsValues, (err, countResult) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    const emailCount = countResult[0].emailCount;

    if (emailCount === 1) {
      return res
        .status(400)
        .json({ result: "Cannot delete the only email for this user" });
    }

    connection.query(deleteEmailSql, deleteEmailValues, (err, result) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ result: "Email not found for this user" });
      }

      return res.status(200).json({ result: "Email deleted successfully" });
    });
  });
});

router.delete("/:id", (req, res) => {
  const userId = req.params.id;

  const deletePhonesSql = "DELETE FROM phones WHERE user_id = ?";
  const deleteEmailsSql = "DELETE FROM emails WHERE user_id = ?";
  const deleteUserSql = "DELETE FROM users WHERE id = ?";
  const values = [userId];

  connection.query(deletePhonesSql, values, (err, result) => {
    if (err) {
      return res.status(400).json({ result: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ result: "User not found" });
    }

    connection.query(deleteEmailsSql, values, (err, result) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      connection.query(deleteUserSql, values, (err, result) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        return res.status(200).json({ result: "User deleted successfully" });
      });
    });
  });
});

router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, cpf } = req.body;

  if (!name || !cpf)
    return res.status(400).json({ result: "Name and CPF are required" });
  if (name.length < 3)
    return res
      .status(400)
      .json({ result: "Name must contain at least 3 characters" });
  if (!validateCPFFormat(cpf))
    return res.status(400).json({ result: "CPF must contain only numbers" });
  if (!validateCPF(cpf)) return res.status(400).json({ result: "Invalid CPF" });
  const cpfExists = await checkIfCpfExistswithId(cpf, userId);
  if (cpfExists) return res.status(400).json({ result: "CPF already exists" });

  const sql = "UPDATE users SET name = ?, cpf = ? WHERE id = ?";
  const values = [name, cpf, userId];

  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ result: "User not found" });
    }

    return res.status(200).json({ result: "User updated successfully" });
  });
});

router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const userSql = "SELECT id, name, cpf FROM users WHERE id = ?";
  const emailsSql = "SELECT email_address FROM emails WHERE user_id = ?";
  const phonesSql = "SELECT ddd, phone_number FROM phones WHERE user_id = ?";

  connection.query(userSql, [userId], (err, userResult) => {
    if (err) {
      return res.status(400).json({ result: err });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ result: "User not found" });
    }

    const user = userResult[0];

    connection.query(emailsSql, [userId], (err, emailsResult) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      const emails = emailsResult.map((email) => email.email_address);

      connection.query(phonesSql, [userId], (err, phonesResult) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        const phones = phonesResult.map((phone) => ({
          ddd: phone.ddd,
          phoneNumber: phone.phone_number,
        }));

        const userWithContacts = {
          id: user.id,
          name: user.name,
          cpf: user.cpf,
          emails,
          phones,
        };

        return res.status(200).json(userWithContacts);
      });
    });
  });
});

router.put("/:id/email", async (req, res) => {
  const userId = req.params.id;
  const { oldEmail, newEmail } = req.body;

  if (!oldEmail || !newEmail)
    return res
      .status(400)
      .json({ result: "Old email and new email are required" });
  const invalidEmails = validateEmail([newEmail]);
  if (invalidEmails.length > 0)
    return res.status(400).json({ result: "Invalid emails: ", invalidEmails });

  const oldEmailExistsSql =
    "SELECT email_address FROM emails WHERE user_id = ? AND email_address = ?";
  connection.query(
    oldEmailExistsSql,
    [userId, oldEmail],
    (err, oldEmailResult) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      if (oldEmailResult.length === 0) {
        return res.status(404).json({ result: "Old email or user not found" });
      }

      // Update the email
      const updateEmailSql =
        "UPDATE emails SET email_address = ? WHERE user_id = ? AND email_address = ?";
      connection.query(updateEmailSql, [newEmail, userId, oldEmail], (err) => {
        if (err) {
          return res.status(400).json({ result: err });
        }

        return res.status(200).json({ result: "Email updated successfully" });
      });
    }
  );
});

router.put("/:id/phone", async (req, res) => {
  const userId = req.params.id;
  const { oldDDD, oldPhoneNumber, newDDD, newPhoneNumber } = req.body;

  if (!oldDDD || !oldPhoneNumber || !newDDD || !newPhoneNumber)
    return res.status(400).json({
      result: "Old phone, old DDD, new phone and new DDD are required",
    });
  const invalidPhones = validatePhones([
    { ddd: newDDD, phoneNumber: newPhoneNumber },
  ]);
  if (invalidPhones.length > 0)
    return res.status(400).json({ result: "Invalid phones: ", invalidPhones });

  const oldPhoneExistsSql =
    "SELECT ddd, phone_number FROM phones WHERE user_id = ? AND ddd = ? and phone_number = ?";
  connection.query(
    oldPhoneExistsSql,
    [userId, oldDDD, oldPhoneNumber],
    (err, oldPhoneResult) => {
      if (err) {
        return res.status(400).json({ result: err });
      }

      if (oldPhoneResult.length === 0) {
        return res
          .status(404)
          .json({ result: "Old DDD, phone number or user not found" });
      }
      const updatePhoneSql =
        "UPDATE phones SET ddd = ?, phone_number = ? WHERE user_id = ? AND ddd = ? and phone_number = ?";
      connection.query(
        updatePhoneSql,
        [newDDD, newPhoneNumber, userId, oldDDD, oldPhoneNumber],
        (err) => {
          if (err) {
            return res.status(400).json({ result: err });
          }

          return res.status(200).json({ result: "Phone updated successfully" });
        }
      );
    }
  );
});

module.exports = router;
