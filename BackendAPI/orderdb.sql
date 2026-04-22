/*Author: Mayra Arias CSCI 467*/
/*Order Database*/

CREATE TABLE orderdb (
	id INT NOT NULL AUTO_INCREMENT PRIMARY_KEY,
	quotes_id INT,
	created DATETIME DEFAULT CURRENT_TIMESTAMP,
	commission INT NOT NULL,
	quote_amount DECIMAL(11, 2),
	PRIMARY KEY(id)
);
