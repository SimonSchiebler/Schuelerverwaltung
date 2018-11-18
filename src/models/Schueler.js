var mongoose = require('mongoose');

var SchuelerSchema = mongoose.Schema({
	vorname: {
		type: String
	},
	nachname: {
		type: String
    },
    email: {
        type: String
    },
    anlegeID: {
        type: String
    }
}, { collection : 'schueler' });

var User = module.exports = mongoose.model('Schueler', SchuelerSchema);

module.exports.createSchueler = function(newUser, callback){
	newUser.save(callback);
}

module.exports.getSchuelerByAnlegeID = function (AnlegeID, callback){
    let query = {AnlegeID: AnlegeID}
    User.find(query, callback);
}