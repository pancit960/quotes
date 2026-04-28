//Fitz Ramirez

//connect to the database
const connection = require('../db/connection');


module.exports = {
    //grabs all sanctioned quotes
    getSanctionedQuotes: (cb) => {
        db.query(
            //grabs names
            `SELECT q.id q.customer_name, q.final_total, q.sancitoned at,
            a.name AS associate_name
            From quotes q
            JOIN associate data a ON q.associate_id = a.id
            WHERE q.quote_status = 'sanctioned'
            ORDER BY q.sanctioned_at DESC`,
            (err,rows)=>{cd(rows);}
        );
    },

    //getQuoteById: get single quote by its primary key
    //modal uses it to get full quote details
    getQuoteById: (id, cb) => {
        db.query(
            //? stop sql injection shenanigans
            `SELECT * FROM quotes WHERE id = ?`,
            [id],
            (err,rows) => {cd(rows[0]); }
        );
    },

    //getLineItems: get line items belonging to a spcific quote
    getLineItems: (quoteId, cb) => {
        db.query(
            `SELECT * FROM quote_desc WHERE  quote_id = ?`,
            [quoteId],
            (err,rows) => {cd(rows);} //you can get multiple line items per quote
        );
    },

    //getNotes: fetches all secret notes
    //customer doesn't get to see these
    getNotes: (quoteId, cb) => {
        db.query(
            `SELECT * FROM secret_notes WHERE quote_id = ?`,
            [quoteId],
            (err,rows) => {cb(rows);} //you can have multiple notes per quotes
        );
    },

    //markedOrdered: update quote record after makred as 'ordered'
    //commissionPct = rate returned by thre external system
    //commisionTotal = actual dollar amount after the math is done
    //processingDate = date string returned by external system
    markOrdered: (quoteId,commissionPct, commissionTotal, processingDate, cb) => {
        db.query(
            `UPDATE quotes
            SET quote_status    = 'ordered',
                commission_pct  = ?,
                commission_total = ?,
                processing_date = ?,
                ordered_at      = NOW()
            WHERE id = ?`,
            //NOW() sets orderd at to current timestamp
            [commmissionPct, commissionTotal, processingDate, quoteId],
            (err) => {cb(err);}
        );
    },

    addCommissionToAssociate: (associateId, commissionTotal, cb) => {
        db.query(
            //commission = commission + ? adds to the existing value
            `UPDATE associate_data
            SET commission = commission + ?
            WHERE id = ?`,
            [commissionTotal, associateId],
            (err) => { cb(err);}
        );
    },

    //insertOrder: create new row in orderdb as a permanent
    insertOrder: (quoteId, quoteAmount, quoteDiscount, commissionRate, commisssionAmt, cb) => {
        db.query(
            `INSERT INTO orderdb
                (quote_id, quote_amount, quote_discount, commission_rate, commission_amt)
            VALUES (?, ?, ?, ?, ?)`,
            [quoteId, quoteAmount, quoteDiscount, commissionRate, commissionAmt],
            //has insertId if needed later
            (err, result) => { cd(err, result);}
        );
    }
};