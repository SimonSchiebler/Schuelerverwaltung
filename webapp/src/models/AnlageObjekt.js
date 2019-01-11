const Schueler = require('./Schueler')
const mongoose = require('mongoose');

var anlageObjekt = mongoose.Schema({
	anlageID: {
		type: String
	},
	aktiv: {
		type: Boolean
	},
	angelegtDurch: String,
	anzahlSchueler: Number
}, { collection: 'anlageObjekt' });

var User = module.exports = mongoose.model('anlageObjekt', anlageObjekt);

module.exports.changeAnzahlSchueler = function (anlageID, amount) {
	return new Promise((resolve, reject) => {
		User.findOneAndUpdate({ anlageID: anlageID }, { $inc: { anzahlSchueler: amount } }, function (err, obj) {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

module.exports.createAnlageObjekt = function (aID, username, aktiv = true) {
	let newAnlegeID = new User({
		anlageID: aID,
		aktiv: aktiv,
		angelegtDurch: username,
		anzahlSchueler: 0
	})

	return this.getAnlegeObjektByID(aID)
		.then((obj) => {
			return new Promise((resolve, reject) => {
				if (!obj.obj) {
					newAnlegeID.save((err, obj) => {
						if (err) {
							reject({ err: err, obj: obj })
						} else {
							resolve({ err: err, obj: obj })
						}
					});
				} else {
					reject({ err: new Error('Anlege Objekt bereits definiert') })
				}

			})
		})
}

module.exports.getAnlegeObjektByID = function (anlageID) {
	return new Promise((resolve, reject) => {
		var query = { anlageID: anlageID };
		User.findOne(query, function (err, obj) {
			return new Promise((resolve, reject => {
				if (err) {
					reject({ err: err, obj: obj })
				} else {
					resolve({ err: err, obj: obj })
				}
			}))
		});
	})
}

module.exports.getActiveAnlegeIDs = function () {
	return new Promise((resolve, reject) => {
		User.find( function (err, obj) {
			if (err) {
				reject(err)
			} else {
				resolve(obj)
			}
		})
	})
}

module.exports.deleteAnlegeObjektByID = function (anlageID) {
	return new Promise((resolve, reject) => {
		User.deleteOne({ anlageID: anlageID }, (err) => (err) ? reject(err) : resolve(err))
	});
}

module.exports.setAktiv = function (anlageID, aktiv) {
	return new Promise((resolve, reject) => {
		User.findOneAndUpdate({ anlageID: anlageID }, {aktiv: aktiv} ,(err) => (err) ? reject(err) : resolve(err))
	});
}