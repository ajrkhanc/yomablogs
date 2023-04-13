var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var tagSchema = new Schema({
    Name: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('tags',tagSchema);