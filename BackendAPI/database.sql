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

INSERT INTO associate_data
VALUES 
(10000001, 'Apple Banana', 'applePass123', .01, '123 Hashbrown Time'),
(10000002, 'Orange Grape', '0)0)0)0)', 12.34, '123455677 ABC'),
(10000003, 'Straw Berry', 'password', 1234.56, '456 Tree'),
(10000004, 'Potato Tomato', 'QcU74nc)%f', 0, '1Hhhhhhhh'),
(10000005, 'Apple Sauce', 'passwword', 11111.11, 'NIU');