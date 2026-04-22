/*Author: Riff Talsma CSCI 467*/
/*List of Quotes*/
USE csci467proj;

CREATE TABLE quotes ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    sales_id INT,
    sanctioned CHAR(50) NOT NULL,
    time_created DATETIME
);

CREATE TABLE quote_desc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL,
    description VARCHAR(300),
    price DOUBLE(9,2)
);

CREATE TABLE secret_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_ID INT NOT NULL,
    note VARCHAR(300)
);

CREATE TABLE associate_data (
  user_id INT PRIMARY KEY,
  name VARCHAR(255),
  user_pass VARCHAR(255),
  commission DECIMAL(11,2),
  address VARCHAR(255)
);

CREATE TABLE orderdb (
	id INT NOT NULL AUTO_INCREMENT,
	quotes_id INT,
	created DATETIME DEFAULT CURRENT_TIMESTAMP,
	commission INT NOT NULL,
	quote_amount DECIMAL(11, 2),
	PRIMARY KEY(id)
);

ALTER TABLE associate_data AUTO_INCREMENT = 10000001;
