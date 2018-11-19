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
}, { collection: 'schueler' });

var User = module.exports = mongoose.model('Schueler', SchuelerSchema);

module.exports.createSchueler = function (newUser) {
    return new Promise((resolve, reject) => {
        newUser.save(resolve());
    })
}

module.exports.getSchuelerByAnlegeID = function (AnlegeID) {
    return new Promise((resolve, reject) => {
        let query = { AnlegeID: AnlegeID }
        User.find(query, (err, obj) => resolve({ err: err, obj: obj }));
    })
}

module.exports.deleteSchuelerByID = function (AnlegeID) {
    return new Promise((resolve, reject) => {
        let query = { anlegeID: AnlegeID }
        User.deleteMany(query, (err) => (err)? reject(err) : resolve(err));
    })
}