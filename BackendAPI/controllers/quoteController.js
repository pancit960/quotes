//Author: Riff Talsma
const quoteModel = require('../models/quoteModel');
const itemModel = require('../models/quoteItemModel');
const noteModel = require('../models/quoteNoteModel');


module.exports = {
    //getAll
    getAll: (cb) => {
        quoteModel.getAll(cb);
    },

    //getById
    getById: (id, cb) => {
        quoteModel.getById(id, cb);
    },

    //creation
    create: (data, cb) => {
        quoteModel.create(data, cb);
    },

    getFullQuote: (id, cb) => {
        quoteModel.getById(id, (quote) => {
            itemModel.getItemsByQuote(id, (items) => {
                noteModel.getNotesByQuote(id, (notes) => {
                    const total = items.reduce((sum, i) => sum + i.price, 0);
                    cb({quote, items, notes, total});
                });
            });
        });
    }
};