const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sha = require('sha256')
const router = express.Router();
const randomstring = require('randomstring')
const User = require('./../models/Lehrer')
const Schueler = require('./../models/Schueler')
const AnlageObjekt = require('./../models/AnlageObjekt')
const fs = require('fs')
const stream = require('stream')
const json2csv = require('json2csv').Parser;

const fields = [
    'SCHUELER_NAME',
    'SCHUELER_VORNAME',
    'SCHUELER_GESCHLECHT',
    'SCHUELER_GEB_DAT',
    'SCHUELER_GEB_ORT',
    'SCHUELER_GEB_LAND',
    'SCHUELER_STAAT_1',
    'SCHUELER_ZUSATZ_FACHHOCHSCHULE',
    'SCHUELER_LETZTE_SCHULE',
    'SCHUELER_SPRACHE',
    'SCHUELER_VORBILDUNG',
    'SCHUELER_EMAIL',
    'SCHUELER_BEREITS_SCHUELER',
    'SCHUELER_FREMDSPRACHEN',
    'SCHUELER_KLASSE',
    'SCHUELER_BULAND',
    'SCHUELER_STRASSE',
    'SCHUELER_PLZ',
    'SCHUELER_LANDKREIS',
    'SCHUELER_ORT',
    'SCHUELER_TEL1',
    'SCHUELER_TEL2',
    'BEZUG1_PERSON',
    'BEZUG1_NAME',
    'BEZUG1_VORNAME',
    'BEZUG1_STRASSE',
    'BEZUG1_PLZ',
    'BEZUG1_ORT',
    'BEZUG1_EMAIL',
    'BEZUG1_TEL',
    'BEZUG1_FAX',
    'BEZUG2_PERSON',
    'BEZUG2_NAME',
    'BEZUG2_VORNAME',
    'BEZUG2_STRASSE',
    'BEZUG2_PLZ',
    'BEZUG2_ORT',
    'BEZUG2_EMAIL',
    'BEZUG2_TEL',
    'BEZUG2_FAX',
    'BERUF_NAME',
    'BERUF_NR',
    'BETRIEB_NAME',
    'AUSBILDER',
    'BETRIEB_STRASSE',
    'BETRIEB_PLZ',
    'BETRIEB_EMAIL',
    'BETRIEB_TEL',
    'BETRIEB_FAX',
    'AUSBILDUNGSBEGINN',
    'AUSBILDUNGSENDE',
    'AUSBILDUNGSVERKUERZUNG',
    'KAMMER',
    'SCHUELER_ERKLAERUNG']

    const opts = {fields}
const converter = new json2csv(opts);
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })


router.route('/login')
    .get(function (req, res, next) {
        res.render('login', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' });
    })
    .post(passport.authenticate('local', { successRedirect: '/lehrer', failureRedirect: '/login', failureFlash: 'Invalid username or password.' }), function (req, res, next) {
        res.redirect('/lehrer')
    });

passport.use(new LocalStrategy(
    {
        usernameField: 'Klasse',
        passwordField: 'Pass'
    },
    function (username, password, done) {
        User.getUserByUsername(username)
            .then((user) => User.comparePassword(password, user))
            .then((obj) => { (obj.isMatch) ? done(null, obj.user) : done(null, false, { message: 'Invalid user or password' }) })
            .catch((err) => { console.error("Login attempt caused:" + err); done(null, false, { message: 'Invalid user or password' }) })
    }
));

router.route('/schueler')
    .get(function (req, res, next) {
        res.render('schuelerAnlegen', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' });
    })
    .post(function (req, res, next) {
        schuelerAnlegen(req, res)
            .then(() => res.render('erfolgreichAngelegt', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' })).catch((err) => (err == 'notFound') ? res.render('404', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' }) : res.render('codeInaktiv'))
    });

router.get('/lehrer', function (req, res, next) {
    if (req.user) {
        AnlageObjekt.getActiveAnlegeIDs()
            .then((IDs) =>
                res.render('lehrer', {
                    user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '', anlegeIDs: IDs
                }))
            .catch(() => res.render('error', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' }))
    } else {
        res.redirect('/login')
    }
})

router.get('/admin', function (req, res) {
    if (req.user && req.user.rolle === 'Admin') {
        User.getUserByRole('Lehrer')
            .then((Lehrerliste => res.render('admin', { Lehrer: Lehrerliste, user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' })))
            .catch(() => res.render('error', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '', userId: req.user ? req.user._id : '' }))
    } else {
        res.redirect('503')
    }

});

router.get('/logout', function (req, res) {
    req.logout();
    res.render('logout', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' });
});

router.get('/', function (req, res) {
    res.render('home', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' })
})

router.post('/lehrer/generateCode', function (req, res) {
    if (req.user) {
        generateCreationCode(req)
            .then((code) => res.send(code.obj.anlageID))
            .catch((err) => res.redirect('/error'))
    } else {
        res.redirect('/503')
    }
})
router.route('/lehrer/code/:id')
    .get(function (req, res) {
        if (req.user) {
            let anlegeCode;
            AnlageObjekt.getAnlegeObjektByID(req.params.id)
                .then((obj) => anlegeCode = obj.obj)
                .then(() => getSchuelerListe(req.params.id))
                .then((schueler) => { res.render('schuelerListe', { schueler: schueler, code: req.params.id, active: anlegeCode.aktiv, user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' }) })
                .catch(() => res.redirect('/error'))
        } else {
            res.redirect('/login')
        }
    })
router.route('/lehrer/code/delete/:id')
    .post(function (req, res) {
        if (req.user) {
            AnlageObjekt.deleteAnlegeObjektByID(req.params.id)
                .then(() => Schueler.deleteSchuelerByAnlegeID(req.params.id))
                .then(() => res.send(200))
                .catch(() => res.send(404))
        } else {
            res.send(503)
        }

    })

router.route('/lehrer/code/toggleaktiv/:id')
    .post(function (req, res) {
        if (req.user) {
            AnlageObjekt.setAktiv(req.params.id, req.body.aktiv)
                .then(() => {
                    res.send(200)
                })
                .catch(() => res.send(404))
        } else {
            res.send(503)
        }
    })

router.get('/error', function (req, res) {
    res.render('error', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' })
})

router.route('/lehrer/schueler/delete/:id/:anlegeID')
    .post(function (req, res) {
        if (req.user) {
            Schueler.deleteSchuelerByID(req.params.id)
                .then(() =>
                    AnlageObjekt.changeAnzahlSchueler(req.params.anlegeID, -1))
                .then(() => res.send(200))
        }
    })

router.get('/503', function (req, res) {
    res.render('503', { user: req.user ? req.user.username : '', userId: req.user ? req.user._id : '' })
})

function schuelerAnlegen(req) {
    let newSchueler = new Schueler({
        SCHUELER_NAME: req.body.SCHUELER_NAME,
        SCHUELER_VORNAME: req.body.SCHUELER_VORNAME,
        SCHUELER_GESCHLECHT: req.body.SCHUELER_GESCHLECHT,
        SCHUELER_GEB_DAT: req.body.SCHUELER_GEB_DAT,
        SCHUELER_GEB_ORT: req.body.SCHUELER_GEB_ORT,
        SCHUELER_GEB_LAND: req.body.SCHUELER_GEB_LAND,
        SCHUELER_STAAT_1: req.body.SCHUELER_STAAT_1,
        SCHUELER_ZUSATZ_FACHHOCHSCHULE: req.body.SCHUELER_ZUSATZ_FACHHOCHSCHULE,
        SCHUELER_LETZTE_SCHULE: req.body.SCHUELER_LETZTE_SCHULE,
        SCHUELER_SPRACHE: req.body.SCHUELER_SPRACHE,
        SCHUELER_VORBILDUNG: req.body.SCHUELER_VORBILDUNG,
        SCHUELER_EMAIL: req.body.SCHUELER_EMAIL,
        SCHUELER_BEREITS_SCHUELER: req.body.SCHUELER_BEREITS_SCHUELER,
        SCHUELER_FREMDSPRACHEN: req.body.SCHUELER_FREMDSPRACHEN,
        SCHUELER_KLASSE: req.body.SCHUELER_KLASSE,
        SCHUELER_BULAND: req.body.SCHUELER_BULAND,
        SCHUELER_STRASSE: req.body.SCHUELER_STRASSE,
        SCHUELER_PLZ: req.body.SCHUELER_PLZ,
        SCHUELER_LANDKREIS: req.body.SCHUELER_LANDKREIS,
        SCHUELER_ORT: req.body.SCHUELER_ORT,
        SCHUELER_TEL1: req.body.SCHUELER_TEL1,
        SCHUELER_TEL2: req.body.SCHUELER_TEL2,
        BEZUG1_PERSON: req.body.BEZUG1_PERSON,
        BEZUG1_NAME: req.body.BEZUG1_NAME,
        BEZUG1_VORNAME: req.body.BEZUG1_VORNAME,
        BEZUG1_STRASSE: req.body.BEZUG1_STRASSE,
        BEZUG1_PLZ: req.body.BEZUG1_PLZ,
        BEZUG1_ORT: req.body.BEZUG1_ORT,
        BEZUG1_EMAIL: req.body.BEZUG1_EMAIL,
        BEZUG1_TEL: req.body.BEZUG1_TEL,
        BEZUG1_FAX: req.body.BEZUG1_FAX,
        BEZUG2_PERSON: req.body.BEZUG2_PERSON,
        BEZUG2_NAME: req.body.BEZUG2_NAME,
        BEZUG2_VORNAME: req.body.BEZUG2_VORNAME,
        BEZUG2_STRASSE: req.body.BEZUG2_STRASSE,
        BEZUG2_PLZ: req.body.BEZUG2_PLZ,
        BEZUG2_ORT: req.body.BEZUG2_ORT,
        BEZUG2_EMAIL: req.body.BEZUG2_EMAIL,
        BEZUG2_TEL: req.body.BEZUG2_TEL,
        BEZUG2_FAX: req.body.BEZUG2_FAX,
        BERUF_NAME: req.body.BERUF_NAME,
        BERUF_NR: req.body.BERUF_NR,
        BETRIEB_NAME: req.body.BETRIEB_NAME,
        AUSBILDER: req.body.AUSBILDER,
        BETRIEB_STRASSE: req.body.BETRIEB_STRASSE,
        BETRIEB_PLZ: req.body.BETRIEB_PLZ,
        BETRIEB_EMAIL: req.body.BETRIEB_EMAIL,
        BETRIEB_TEL: req.body.BETRIEB_TEL,
        BETRIEB_FAX: req.body.BETRIEB_FAX,
        AUSBILDUNGSBEGINN: req.body.AUSBILDUNGSBEGINN,
        AUSBILDUNGSENDE: req.body.AUSBILDUNGSENDE,
        AUSBILDUNGSVERKUERZUNG: req.body.AUSBILDUNGSVERKUERZUNG,
        KAMMER: req.body.KAMMER,
        SCHUELER_ERKLAERUNG: req.body.SCHUELER_ERKLAERUNG,

        anlegeID: req.body.anlegeID,
    })

    return AnlageObjekt.getAnlegeObjektByID(req.body.anlegeID)
        .then((obj) => {
            return new Promise((resolve, reject) => {
                if (!obj.obj) {
                    reject('notFound')
                } else {
                    (obj.obj.aktiv) ? resolve(Schueler.createSchueler(newSchueler)) : reject('inactive')
                }
            })
        })
        .then(() => AnlageObjekt.changeAnzahlSchueler(req.body.anlegeID, 1))
}

router.route('/admin/users/create/')
    .post(function (req, res) {
        if (req.user.rolle === 'Admin') {
            let newLehrer = new User({
                username: req.body.username,
                password: req.body.password,
                rolle: "Lehrer"
            })
            User.createUser(newLehrer)
                .then(res.send(200))
                .catch(res.send(520))
        } else {
            res.send(503)
        }
    })

router.route('/admin/users/changePW/')
    .post(function (req, res) {
        if (req.user.rolle === 'Admin') {
            User.UpdateUserPW(req.body.id, req.body.password)
                .then(() => res.send(200))
                .catch(() => res.send(520))
        } else {
            res.send(503)
        }
    })

router.route('/admin/users/delete/')
    .post(function (req, res) {
        if (req.user.rolle === 'Admin') {
            User.deleteUserById(req.body.id)
                .then(() => res.send(200))
                .catch((err) => res.send(err))
        } else {
            res.send(503)
        }
    })

router.route('/admin/certificate')
    .post(upload.any(), function (req, res) {
        if (req.user.rolle === 'Admin' && req.files.length === 2) {
            fs.readdirSync('./../ssl/').forEach(currentSSLFile => {
                fs.unlinkSync('./../ssl/' + currentSSLFile)
            })
            req.files.forEach(file => {

                if (file.originalname.split('.').pop() === 'cert') {
                    fs.copyFileSync(file.path, './../ssl/schuelerverwaltung.cert')
                } else {
                    fs.copyFileSync(file.path, './../ssl/schuelerverwaltung.key')
                }

            });
            fs.readdirSync('./uploads/').forEach(currentUploadFile => {
                fs.unlinkSync('./uploads/' + currentUploadFile)
            })

            process.exit(0)
        }
    })
    .get(() => {
        res.redirect('/')
    })

router.route('/admin/shutdown')
    .post(function (req, res) {
        if (req.user.rolle === 'Admin') {
            setTimeout(() => {
                process.exit(0)
            }, 5000);
        }
    })

router.route('/Lehrer/getCodeCsv/:id')
    .get(function (req, res) {
        if (req.user && req.user.rolle === 'Admin') {
            getSchuelerListe(req.params.id)
                .then((Schuelerliste) => {
                    Schuelerliste.forEach(schueler => {
                        delete schueler.anlegeID
                        schueler.SCHUELER_VORBILDUNG = schueler.SCHUELER_VORBILDUNG.join(',')
                    });
                    const csvData = converter.parse(Schuelerliste)
                    res.setHeader('Content-Length', csvData.length);
                    
                    
                    var fileContents = Buffer.from(csvData, "utf8");

                    var readStream = new stream.PassThrough();
                    readStream.end(fileContents);
                  
                    res.set('Content-disposition', 'attachment; filename=' + req.params.id + '.csv');
                    res.set('Content-Type', 'text/plain');
                  
                    readStream.pipe(res);

                })
                .catch((err) =>{ res.redirect('/error')})
        } else {
            res.redirect('/login')
        }
    })


function generateCreationCode(req) {
    return AnlageObjekt.createAnlageObjekt(randomstring.generate(6), req.user.username);
}

function getSchuelerListe(id) {
    return new Promise((resolve, reject) => {
        Schueler.find({ anlegeID: id }, function (err, obj) {
            if (err) {
                reject(err)
            } else {
                resolve(obj)
            }
        })
    })
}

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id).then((obj) => done(obj.err, obj.user))
});

module.exports = router
