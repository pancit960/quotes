// Fitz Ramirez

const sanctionModel = require('../models/sanctionModel');

module.exports = {

  // GET /sanction — renders the sanction page with finalized quotes
  getSanctionPage: (req, res) => {
    sanctionModel.getFinalizedQuotes((quotes) => {
      res.render('sanction', { quotes });
    });
  },

  // GET /sanction/:id — returns full quote details as JSON for the modal
  getQuoteDetails: (req, res) => {
    const id = req.params.id;
    sanctionModel.getQuoteById(id, (quote) => {
      if (!quote) return res.status(404).json({ error: 'Quote not found' });

      sanctionModel.getLineItems(id, (lineItems) => {
        sanctionModel.getNotes(id, (notes) => {
          res.json({ quote, lineItems, notes });
        });
      });
    });
  },

  // POST /sanction/approve — marks the quote as sanctioned
  sanctionQuote: (req, res) => {
    const { quoteId } = req.body;
    sanctionModel.sanctionQuote(quoteId, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to sanction quote' });
      res.json({ success: true });
    });
  }

};