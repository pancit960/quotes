// Fitz Ramirez

const db = require('../db/studentConnection');

module.exports = {

  // get all finalized quotes — these are the ones waiting to be sanctioned
  getFinalizedQuotes: (cb) => {
    db.query(
      `SELECT q.id, q.customer_name, q.final_total, q.finalized_at,
              a.name AS associate_name
       FROM quotes q
       JOIN associate_data a ON q.associate_id = a.id
       WHERE q.quote_status = 'finalized'
       ORDER BY q.finalized_at DESC`,
      (err, rows) => { 
        if(err){
            console.error('getFinalizedQuotes, error:',err);
            return cb([]);
        }
        cb(rows);
      }
    );
  },

  // get one quote's full details for the modal
  getQuoteById: (id, cb) => {
    db.query(
      `SELECT * FROM quotes WHERE id = ?`,
      [id],
      (err, rows) => { cb(rows[0]); }
    );
  },

  getLineItems: (quoteId, cb) => {
    db.query(
      `SELECT * FROM quote_desc WHERE quote_id = ?`,
      [quoteId],
      (err, rows) => { cb(rows); }
    );
  },

  getNotes: (quoteId, cb) => {
    db.query(
      `SELECT * FROM secret_notes WHERE quote_id = ?`,
      [quoteId],
      (err, rows) => { cb(rows); }
    );
  },

  // mark a quote as sanctioned — this is what makes it appear on your process orders page
  sanctionQuote: (quoteId, cb) => {
    db.query(
      `UPDATE quotes
       SET quote_status  = 'sanctioned',
           sanctioned_at = NOW()
       WHERE id = ? AND quote_status = 'finalized'`,
      // the AND quote_status = 'finalized' check prevents accidentally
      // sanctioning something that already moved to a later status
      [quoteId],
      (err) => { cb(err); }
    );
  }

};