//Author: Riff Talsma
//will provide some test data in our db for testing purposes
const db = require('./studentConnection');

function insert() {
    console.log("Inserting data...");

    //create quote
    db.query(`INSERT INTO quotes (customer_id, sales_id, sanctioned, time_created)
        VALUES (2, 2, 'YES', NOW())`,
        (err, result) => {
            if(err) throw err;
            const quoteId = result.insertId;
            console.log("Created quote: ", quoteId);

            //add items to the quote
            const items = [
                ['Thermobaric Nuclear Generator Repair', 659000.94],
                ['Steam Turbine Blade', 54000.00],
                ['Labor Service', 0.01]
            ];

            items.forEach(item => {
                db.query(`INSERT INTO quote_desc (quote_id, description, price)
                    VALUES (?, ?, ?)`,
                    [quoteId, item[0], item[1]],
                    (err) => {
                        if(err) throw err;
                    }
                );
            });

            //add notes to quote
            db.query(`INSERT INTO secret_notes (quote_id, note)
                VALUES (?, ?)`,
                [quoteId, 'After nuclear meltdown, we decided to repair the generator instead of sealing it away'],
                (err) => {
                    if(err) throw err;
                }
            );

            console.log("Insertion completed.")
        }
    );
}

insert();
