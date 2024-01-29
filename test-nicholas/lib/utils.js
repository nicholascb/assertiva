function validatePhoneNumber(phoneNumber) {
  const phoneNumberRegex = /^9\d{8}$/;
  return phoneNumberRegex.test(phoneNumber);
}

function validateEmail(emails) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter((email) => !emailRegex.test(email));
  return invalidEmails;
}

function validateDDD(ddd) {
  const dddRegex = /^\d{2}$/;
  return dddRegex.test(ddd);
}

function validatePhones(phones) {
  const invalidPhones = phones.filter((phone) => {
    const { ddd, phoneNumber } = phone;

    return !validateDDD(ddd) || !validatePhoneNumber(phoneNumber);
  });

  return invalidPhones;
}

function checkDuplicateDDDPhones(phones) {
  const dddPhones = phones.map((phone) => phone.ddd + phone.phoneNumber);
  const duplicateDDDPhones = dddPhones.filter(
    (phone, index) => dddPhones.indexOf(phone) !== index
  );
  return duplicateDDDPhones.length > 0;
}

function checkDuplicateEmails(emails) {
  const duplicateEmails = emails.filter(
    (email, index) => emails.indexOf(email) !== index
  );
  return duplicateEmails.length > 0;
}

module.exports = {
  validateDDD,
  validatePhoneNumber,
  validateEmail,
  validatePhones,
  checkDuplicateDDDPhones,
  checkDuplicateEmails,
};
