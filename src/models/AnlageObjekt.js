var mongoose = require('mongoose');

var anlageObjekt = mongoose.Schema({
	anlageID: {
		type: String
	},
	aktiv: {
		type: Boolean
	},
	angelegtDurch: String,
	anzahlSchueler: Number
}, { collection : 'anlageObjekt' });

var User = module.exports = mongoose.model('anlageObjekt', anlageObjekt);

module.exports.createAnlageObjekt = function(newUser, callback){
	newUser.save(callback);
}

module.exports.getAnlegeObjektByID = function(anlageID, callback){
	var query = {anlageID: anlageID};
	//User.find(callback)
	User.findOne(query, callback);
}
