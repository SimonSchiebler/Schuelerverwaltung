const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sha = require('sha256')
const router = express.Router();
const randomstring = require('randomstring')
const User = require('./../models/Lehrer')
const Schueler = require('./../models/Schueler')
const AnlageObjekt = require('./../models/AnlageObjekt')


router.route('/login')
    .get(function (req, res, next) {
        res.render('login', { user: req.user ? req.user.username : '' });
    })
    .post(passport.authenticate('local', { successRedirect: '/lehrer', failureRedirect: '/login', failureFlash: true }), function (req, res, next) {
        console.log(req.body)
        res.redirect('lehrer')
    });

passport.use(new LocalStrategy(
    {
        usernameField: 'Klasse',
        passwordField: 'Pass'
    },

    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });


    }
));

router.route('/schueler')
    .get(function (req, res, next) {
        res.render('schuelerAnlegen', { user: req.user ? req.user.username : '' });
    })
    .post(function (req, res, next) {
        schuelerAnlegen(req, res)
            .then(() => res.render('erfolgreichAngelegt')).catch(() => res.render('schuelerAnlegen'))
    });

router.get('/lehrer', function (req, res, next) {
    if (req.user) {
        getActiveAnlegeIDs(req)
        .then((IDs) =>
         res.render('lehrer', { user: req.user ? req.user.username : '' , anlegeIDs: IDs
        }))
        .catch(() => res.render('error'))
    } else {
        res.render('login', { user: req.user ? req.user.username : '' })
    }
})

router.get('/admin', function (req, res) {
    createUser('test', 'test');
    res.redirect('login')
});

router.get('/logout', function (req, res) {
    req.logout();
    res.render('logout');
});

router.get('/', function (req, res) {
    res.render('home')
})

router.get('/lehrer/generateCode', function (req, res) {
    if (req.user) {
        generateCreationCode(req)
            .then((code) => res.render('creationCode', { code: code.anlageID }))
            .catch((err) => res.redirect('/error'))
    } else {
        res.redirect('/503')
    }
})

router.get('/lehrer/code/:id', function(req, res) {
    if(req.user){
        getSchuelerListe(req.params.id)
        .then((schueler) => {res.render('schuelerListe', {schueler: schueler})})
        .catch(() => res.redirect('/error'))
    }else{
        res.redirect('/login')
    }
})

router.get('/error', function (req, res) {
    res.render('error')
})

router.get('/503', function (req, res) {
    res.render('503')
})

function schuelerAnlegen(req) {
    return new Promise((resolve, reject) => {
        var name = req.body.vorname;
        var email = req.body.email;
        var nachname = req.body.nachname;
        var anlegeID = req.body.anlegeID;

        AnlageObjekt.getAnlegeObjektByID(anlegeID, function (err, obj) {
            if (obj.aktiv) {
                let newSchueler = new Schueler({
                    vorname: name,
                    nachname: nachname,
                    email: email,
                    anlegeID: anlegeID
                })
                Schueler.createSchueler(newSchueler, function (err, schueler) {
                    if (err) {
                        reject()
                    } else {
                        console.log(`created Schueler ${JSON.stringify(schueler)}`)
                        resolve()
                    }
                })
            } else {
                reject()
            }
        })
    })
}

function createUser(username, password) {
    //checking for email and username are already taken
    User.findOne({
        username: {
            "$regex": "^" + username + "\\b", "$options": "i"
        }
    }, function (err, user) {
        if (!user) {
            var newUser = new User({
                username: username,
                password: password
            });
            User.createUser(newUser, function (err, user) {
                if (err) throw err;
                console.log(user);
            });
        }
    });

};

function generateCreationCode(req) {
    return new Promise((resolve, reject) => {
        let creationCodeFound = false;
        let newID = randomstring.generate(6);
        AnlageObjekt.getAnlegeObjektByID(newID, function (err, obj) {
            if (!obj) {
                let newAnlegeID = new AnlageObjekt({
                    anlageID: newID,
                    aktiv: true,
                    angelegtDurch: req.user.username
                })
                AnlageObjekt.create(newAnlegeID, function (err, anlegeID) {
                    creationCodeFound = true;
                    if (err) {
                        reject()
                    } else {
                        resolve(anlegeID)
                    }
                })
            }
        })
    })
}

function getActiveAnlegeIDs(req) {
    return new Promise((resolve, reject) => {
        AnlageObjekt.find({ aktiv: true }, function (err, obj) {
            if (err) {
                reject(err)
            } else {
                if (obj){
                    resolve(obj)
                }else{
                    reject(obj)
                }
            }
        })
    })
}

function getSchuelerListe(id){
    return new Promise((resolve, reject) => {
        Schueler.find({anlegeID: id}, function (err, obj) {
            if(err){
                reject(err)
            }else{
                resolve(obj)
            }
        })
    })
}

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});


module.exports = router
