const express = require('express');
const router = express.Router();

router.get('/login', function(req, res, next) {
    res.render('login', {title: 'Login'});
})

router.post('/login', function(req, res, next) {
    console.log(req.body.user)
    console.log(req.body.pass)
    req.flash('success_msg', 'asdf')
    res.redirect('login')
})

router.get('/schuelerAnlegen', function(req, res, next) {
    res.render('schuelerAnlegen', {title: 'Login'});
})

router.get('/schuelerliste', function(req, res, next) {
    res.render('login', {title: 'Login'});
})

module.exports = router