var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var categorySchema = new Schema({
    Name: {
        type: String,
        required: true
    },

    Caturl: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('Category',categorySchema);