const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodeCouchDb = require('node-couchdb');
const fs = require('fs');
//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;
const hbs = require('express-handlebars')
const logger = require('morgan')
const cookieParser = require('cookie-parser') 
const routes = require('./routes/index')
const session = require('express-session')
const expressValidator = require('express-validator')
const flash = require ('connect-flash')
const passport = require('passport')

var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./../ssl/22029280_schuelerverwaltung.key', 'utf8');
var certificate = fs.readFileSync('./../ssl/22029280_schuelerverwaltung.cert', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const couch = new nodeCouchDb({
    auth: {
        user: 'admin',
        password: 'admin'
    },
    host: '10.1.1.1',
    protocol: 'http',
});

const SCHUELERDB = 'schueler';
const viewUrl = '_design/v1/_view/id'

const app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname,'views', 'layouts')}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize())
app.use(passport.session())

app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash())

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    next();
})

app.use('/', routes)

app.set('port', (process.env.PORT || 3000))

app.listen(app.get('port'), function () {
    console.log(`Server started on Port ${app.get('port')}`);
})

httpServer.listen(8080);
httpsServer.listen(8443);
