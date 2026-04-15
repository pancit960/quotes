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