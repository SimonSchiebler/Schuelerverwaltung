const express = require('express');
const router = express.Router();

router.get('/login', function(req, res, next) {
    res.render('login', {title: 'Login'});
})

router.post('/login', function(req, res, next) {
    console.log(req.body)
    req.flash('success_msg', 'asdf')
    res.redirect('login')
})

router.get('/schuelerAnlegen', function(req, res, next) {
    res.render('schuelerAnlegen', {title: 'Login'});
})

router.get('/schuelerliste', function(req, res, next) {
    res.render('login', {title: 'Login'});
})

router.get('/lehrer', function(req, res, next) {
    res.render('lehrer', {title: 'Login'});
})

module.exports = router
