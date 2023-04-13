var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var feedbackSchema = new Schema({
    user: {
        type: String,
        required: true
    },
	email: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    PublishDate: Date,
});


module.exports = mongoose.model('Feedback', feedbackSchema);