CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(256) NOT NULL,
    cpf VARCHAR(11) NOT NULL
);


CREATE TABLE phones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    phone_number VARCHAR(9) NOT NULL,
    ddd VARCHAR(2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE emails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    email_address VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
