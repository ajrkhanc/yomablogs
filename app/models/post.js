var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    posturl:{
        type: String,
        required: true,
        unique:true
    },
    Content: {
        type: String,
        default : '#'
    },

    Description: {
        type: String,
        default : '#'
    },

    Author:{
        type: String,
        required: true
    },
    AuthorFullname:{
        type: String,
        required: true
    },
    tags : [String],
    category: [String],
    ImageURL : {
        type: String, 
        default : '#'
    },
    ImageAlt : {
        type: String,
        default : '#'
    },
    visitors: {
        type: Number,
        default : 0
    },
    PublishDate: Date,
    ModifiedDate : {
        type: String
    },
    isPublished: {
        type: String,
        enum: ['0', '1', '2'],
        default: '1'
    }
});

// postSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post',postSchema);