/*Author: Riff Talsma CSCI 467*/
/*List of Quotes*/
CREATE DATABASE IF NOT EXISTS csci467proj;
USE csci467proj;

/*Add into associates data: email. May need more based on other needs*/
CREATE TABLE associate_data (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  user_pass VARCHAR(255) NOT NULL,
  email_addr VARCHAR(100) NOT NULL,
  commission DECIMAL(11,2) NOT NULL DEFAULT 0.00,
  address VARCHAR(255)
);

/*add more info into quotes, need: customer email, statuses, discounts, subtotal, commission details*/
/* maybe dates for each stage */
CREATE TABLE quotes ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    quote_status ENUM('draft', 'finalized', 'sanctioned', 'ordered') NOT NULL default 'draft',
    associate_id INT NOT NULL,
    discount_type ENUM('percentage', 'amount') NULL,
    discount_val DECIMAL(11,2) NULL DEFAULT 0.00,
    discount_final DECIMAL(11,2) NULL DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    final_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    commission_pct DECIMAL(5,4) NULL,
    commission_total DECIMAL (10,2) NULL,
    processing_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP NULL,
    sanctioned_at TIMESTAMP NULL,
    ordered_at TIMESTAMP NULL,
    CONSTRAINT quote_associate_fk
        FOREIGN KEY(associate_id) REFERENCES associate_data(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

/*line items for our quote when observing */
CREATE TABLE quote_desc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL,
    description TEXT,
    price DOUBLE(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT quote_desc_fk
        FOREIGN KEY (quote_id) REFERENCES quotes(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

/*secret notes to include author, id, text, etc*/
CREATE TABLE secret_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL,
    associate_id INT NULL,
    note_author VARCHAR(100) NOT NULL DEFAULT 'HQ',
    note TEXT NULL,
    CONSTRAINT note_quote_fk
        FOREIGN KEY(quote_id) REFERENCES quotes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT note_associate_fk
        FOREIGN KEY (associate_id) REFERENCES associate_data(id)
        ON UPDATE CASCADE ON DELETE SET NULL
);


/*Author: Mayra Arias CSCI 467*/
/*Order Database*/
/*Need to add, processing data, discounts, external data, etc.)*/
CREATE TABLE orderdb (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	quote_id INT NOT NULL,
	created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    quote_discount DECIMAL(11,2) NOT NULL DEFAULT 0.00,
	commission_amt DECIMAL(11,2) NULL,
    commission_rate DECIMAL(5,4) NULL,
	quote_amount DECIMAL(11, 2) NOT NULL,
    CONSTRAINT order_quote_fk
        FOREIGN KEY (quote_id) REFERENCES quotes(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

/*Provide some indexes to speed up queries, will help in the long run when I try coding the models */
CREATE INDEX quote_status_index ON quotes(quote_status);
CREATE INDEX quotes_associate_index ON quotes(associate_id);
CREATE INDEX quotes_customer_index ON quotes(customer_id);
CREATE INDEX quotes_created_index ON quotes(created_at);
CREATE INDEX quote_desc_index ON quote_desc(quote_id);
CREATE INDEX quote_notes_index ON secret_notes(quote_id);
CREATE INDEX orders_quotes_index ON orderdb(quote_id);