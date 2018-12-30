var mongoose = require('mongoose');

var SchuelerSchema = mongoose.Schema({
    SCHUELER_NAME: {
        type: String
    },
    SCHUELER_VORNAME: {
        type: String
    },
    SCHUELER_GESCHLECHT: {
        type: String
    },
    SCHUELER_GEB_DAT: {
        type: String
    },
    SCHUELER_GEB_ORT: {
        type: String
    },
    SCHUELER_STAAT_1: {
        type: String
    },
    SCHUELER_PLZ: {
        type: String
    },
    SCHUELER_ORT: {
        type: String
    },
    SCHUELER_TEL1: {
        type: String
    },
    SCHUELER__TEL2: {
        type: String
    },
    "SCHUELER-SCHULJAHR": {
        type: String
    },
    SCHUELER_EINTRITT: {
        type: String
    },
    V_NAME: {
        type: String
    },
    V_VORNAME: {
        type: String
    },
    V_TITEL: {
        type: String
    },
    V_SORGEBERECHTIGT: {
        type: String
    },
    V_STRASSE: {
        type: String
    },
    V_PLZ: {
        type: String
    },
    V_ORT: {
        type: String
    },
    V_BERUF: {
        type: String
    },
    V_FIRMA: {
        type: String
    },
    V_TEL1: {
        type: String
    },
    V_TEL2: {
        type: String
    },
    V_EMAIL: {
        type: String
    },
    M_NAME: {
        type: String
    },
    M_MUTTER: {
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

module.exports.deleteSchuelerByAnlegeID = function (AnlegeID) {
    return new Promise((resolve, reject) => {
        let query = { anlegeID: AnlegeID }
        User.deleteMany(query, (err) => (err)? reject(err) : resolve(err));
    })
}

module.exports.deleteSchuelerByID = function(schuelerID) {
    return new Promise((resolve, reject) => {
        User.deleteOne({_id: schuelerID}, (err) => (err) ? reject(err) : resolve(err))
    })
}
