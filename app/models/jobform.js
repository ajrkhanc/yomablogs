var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var jobformSchema = new Schema({
    FullName: {
        type: String,
        default: ''
    },
	Gender: {
        type: String,
        default: ''
    },
    Dob: {
        type: String,
        default: ''
    },
    MobileNumber: {
        type: String,
        default: ''
    },
    WhatsappMobileNumber: {
        type: String,
        default: ''
    },
    EmailAddress: {
        type: String,
        default: ''
    },
    CurrentCity: {
        type: String,
        default: ''
    },
    CurrentState: {
        type: String,
        default: ''
    },
    PermanentCity: {
        type: String,
        default: ''
    },
    PermanentState: {
        type: String,
        default: ''
    },
    PermanentAddress: {
        type: String,
        default: ''
    },
    CurrentAddress: {
        type: String,
        default: ''
    },
    HighestQualification: {
        type: String,
        default: ''
    },
    ExperienceYears: {
        type: String,
        default: ''
    },
    ExperienceMonths: {
        type: String,
        default: ''
    },
    Designation: {
        type: String,
        default: ''
    },
    Expectedsalary: {
        type: String,
        default: ''
    },
    VehicleRequirement: {
        type: String,
        default: ''
    },
    SmartPhone: {
        type: String,
        default: ''
    },
    NativeLanguage: {
        type: String,
        default: ''
    },
    Resume: {
        type: String,
        default: ''
    },
    PublishDate: Date,
});


module.exports = mongoose.model('Jobform', jobformSchema);