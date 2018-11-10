const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const adminuser = require('../../adminUser')
const router = express.Router();

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login' });
})

passport.use(new LocalStrategy(
    {
        usernameField: 'Klasse',
        passwordField: 'Pass'
    },

    function (username, password, done) {
        if (username == 'asd@asd.de' && password == 'asd') {
            return (done('asd@asd.de'))
        }
    }
));

router.post('/login', passport.authenticate('local', { successRedirect: '/lehrer', failureRedirect: '/login', failureFlash: true }), function (req, res, next) {
    console.log(req.body)
    res.redirect('lehrer')
})

router.get('/schuelerAnlegen', function (req, res, next) {
    res.render('schuelerAnlegen', { title: 'Login' });
})

router.get('/schuelerliste', function (req, res, next) {
    res.render('login', { title: 'Login' });
})

router.get('/lehrer', function (req, res, next) {
    res.render('lehrer', { title: 'Login' });
})

module.exports = router
