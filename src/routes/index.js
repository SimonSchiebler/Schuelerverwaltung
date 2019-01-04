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

const multer = require('multer')
const upload = multer({dest: 'uploads/'})


router.route('/login')
    .get(function (req, res, next) {
        res.render('login', { user: req.user ? req.user.username : '' });
    })
    .post(passport.authenticate('local', { successRedirect: '/lehrer', failureRedirect: '/login', failureFlash: true }), function (req, res, next) {
        console.log(req.body)
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
            .then((obj) => { (obj.isMatch) ? done(null, obj.user) : done(null, false, { message: 'Invalid password' }) })
            .catch((err) => { throw err })
    }
));

router.route('/schueler')
    .get(function (req, res, next) {
        res.render('schuelerAnlegen', { user: req.user ? req.user.username : '' });
    })
    .post(function (req, res, next) {
        schuelerAnlegen(req, res)
            .then(() => res.render('erfolgreichAngelegt',{user: req.user ? req.user.username : ''})).catch((err) => (err == 'notFound') ? res.render('404',{user: req.user ? req.user.username : ''}) : res.render('codeInaktiv'))
    });

router.get('/lehrer', function (req, res, next) {
    if (req.user) {
        AnlageObjekt.getActiveAnlegeIDs()
            .then((IDs) =>
                res.render('lehrer', {
                    user: req.user ? req.user.username : '', anlegeIDs: IDs
                }))
            .catch(() => res.render('error',{user: req.user ? req.user.username : ''}))
    } else {
        res.redirect('/login')
    }
})

router.get('/admin', function (req, res) {
    if (req.user && req.user.rolle === 'Admin') {
        User.getUserByRole('Lehrer')
            .then((Lehrerliste => res.render('admin', { Lehrer: Lehrerliste , user: req.user ? req.user.username : ''})))
            .catch(() => res.render('error', {user: req.user ? req.user.username : ''}))
    } else {
        res.redirect('503')
    }

});

router.get('/logout', function (req, res) {
    req.logout();
    res.render('logout',{user: req.user ? req.user.username : ''});
});

router.get('/', function (req, res) {
    res.render('home', {user: req.user ? req.user.username : ''})
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
                .then((schueler) => { res.render('schuelerListe', { schueler: schueler, code: req.params.id, active: anlegeCode.aktiv, user: req.user ? req.user.username : ''}) })
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
    res.render('error', {user: req.user ? req.user.username : ''})
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
    res.render('503', {user: req.user ? req.user.username : ''})
})

function schuelerAnlegen(req) {
    let newSchueler = new Schueler({
        SCHUELER_NAME: req.body.SCHUELER_NAME,
        SCHUELER_VORNAME: req.body.SCHUELER_VORNAME,
        SCHUELER_GESCHLECHT: req.body.SCHUELER_GESCHLECHT,
        SCHUELER_GEB_DAT: req.body.SCHUELER_GEB_DAT,
        SCHUELER_GEB_ORT: req.body.SCHUELER_GEB_ORT,
        SCHUELER_STAAT_1: req.body.SCHUELER_STAAT_1,
        SCHUELER_PLZ: req.body.SCHUELER_PLZ,
        SCHUELER_ORT: req.body.SCHUELER_ORT,
        SCHUELER_TEL1: req.body.SCHUELER_TEL1,
        SCHUELER__TEL2: req.body.SCHUELER__TEL2,
        "SCHUELER-SCHULJAHR": req.body["SCHUELER-SCHULJAHR"],
        SCHUELER_EINTRITT: req.body.SCHUELER_EINTRITT,
        V_NAME: req.body.V_NAME,
        V_VORNAME: req.body.V_VORNAME,
        V_TITEL: req.body.V_TITEL,
        V_SORGEBERECHTIGT: req.body.V_SORGEBERECHTIGT,
        V_STRASSE: req.body.V_STRASSE,
        V_PLZ: req.body.V_PLZ,
        V_ORT: req.body.V_ORT,
        V_BERUF: req.body.V_BERUF,
        V_FIRMA: req.body.V_FIRMA,
        V_TEL1: req.body.V_TEL1,
        V_TEL2: req.body.V_TEL2,
        V_EMAIL: req.body.V_EMAIL,
        M_NAME: req.body.M_NAME,
        M_MUTTER: req.body.M_MUTTER,
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
            createLehrer(req.body.username, req.body.password)
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
    .post(upload.any(),function (req, res) {
        if (req.user.rolle === 'Admin' && req.files.length === 2){
            fs.readdirSync('./../ssl/').forEach(currentSSLFile => {
                fs.unlinkSync('./../ssl/' + currentSSLFile)
            })
            req.files.forEach(file => {

                if (file.originalname.split('.').pop() === 'cert'){
                    fs.copyFileSync(file.path,'./../ssl/schuelerverwaltung.cert')
                }else{
                    fs.copyFileSync(file.path,'./../ssl/schuelerverwaltung.key')
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
        if(req.user === 'Admin'){
            setTimeout(() => {
                process.exit(0)
            }, 5000);
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
