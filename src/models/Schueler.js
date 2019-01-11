var mongoose = require('mongoose');

var SchuelerSchema = mongoose.Schema({

    SCHUELER_NAME:{type: String},
    SCHUELER_VORNAME:{type: String},
    SCHUELER_GESCHLECHT:{type: String},
    SCHUELER_GEB_DAT:{type: String},
    SCHUELER_GEB_ORT:{type: String},
    SCHUELER_GEB_LAND:{type: String},
    SCHUELER_STAAT_1:{type: String},
    SCHUELER_ZUSATZ_FACHHOCHSCHULE:{type: String},
    SCHUELER_LETZTE_SCHULE:{type: String},
    SCHUELER_SPRACHE:{type: String},
    SCHUELER_VORBILDUNG:{type: Array},
    SCHUELER_EMAIL:{type: String},
    SCHUELER_BEREITS_SCHUELER:{type: String},
    SCHUELER_FREMDSPRACHEN:{type: String},
    SCHUELER_KLASSE:{type: String},
    SCHUELER_BULAND:{type: String},
    SCHUELER_STRASSE:{type: String},
    SCHUELER_PLZ:{type: String},
    SCHUELER_LANDKREIS:{type: String},
    SCHUELER_ORT:{type: String},
    SCHUELER_TEL1:{type: String},
    SCHUELER_TEL2:{type: String},
    BEZUG1_PERSON:{type: String},
    BEZUG1_NAME:{type: String},
    BEZUG1_VORNAME:{type: String},
    BEZUG1_STRASSE:{type: String},
    BEZUG1_PLZ:{type: String},
    BEZUG1_ORT:{type: String},
    BEZUG1_EMAIL:{type: String},
    BEZUG1_TEL:{type: String},
    BEZUG1_FAX:{type: String},
    BEZUG2_PERSON:{type: String},
    BEZUG2_NAME:{type: String},
    BEZUG2_VORNAME:{type: String},
    BEZUG2_STRASSE:{type: String},
    BEZUG2_PLZ:{type: String},
    BEZUG2_ORT:{type: String},
    BEZUG2_EMAIL:{type: String},
    BEZUG2_TEL:{type: String},
    BEZUG2_FAX:{type: String},
    BERUF_NAME:{type: String},
    BERUF_NR:{type: String},
    BETRIEB_NAME:{type: String},
    AUSBILDER:{type: String},
    BETRIEB_STRASSE:{type: String},
    BETRIEB_PLZ:{type: String},
    BETRIEB_EMAIL:{type: String},
    BETRIEB_TEL:{type: String},
    BETRIEB_FAX:{type: String},
    AUSBILDUNGSBEGINN:{type: String},
    AUSBILDUNGSENDE:{type: String},
    AUSBILDUNGSVERKUERZUNG:{type: String},
    KAMMER:{type: String},
    SCHUELER_ERKLAERUNG:{type: String},

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
