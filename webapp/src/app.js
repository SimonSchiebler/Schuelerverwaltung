const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const hbs = require('express-handlebars')
const logger = require('morgan')
const cookieParser = require('cookie-parser') 
const routes = require('./routes/index')
const session = require('express-session')
const expressValidator = require('express-validator')
const flash = require ('connect-flash')
const passport = require('passport')
const mongoose = require('mongoose');
const Lehrer = require('Lehrer');

const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('./../ssl/schuelerverwaltung.key', 'utf8');
const certificate = fs.readFileSync('./../ssl/schuelerverwaltung.cert', 'utf8');

let MONGOHOST = ''
if(process.argv[2] === 'docker'){
    console.log('starting application in docker mode')
    MONGOHOST = 'mongo:27017'
}else{
    console.log('starting application in development mode')
    MONGOHOST = '127.0.0.1:27017'
}

const MONGOSERVICE = 'test'

const credentials = {key: privateKey, cert: certificate};

mongoose.connect(`mongodb://${MONGOHOST}/${MONGOSERVICE}`);
const db = mongoose.connection;

const app = express();

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname,'views', 'layouts')}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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

//app.set('port', (process.env.PORT || 3000))

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

Lehrer.ensureAdminExists()
