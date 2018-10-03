const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodeCouchDb = require('node-couchdb');

const couch = new nodeCouchDb({
    auth:{
        user: 'admin',
        password: 'admin'
    },
    host: '10.1.1.1',
    protocol: 'http',
});

couch.listDatabases().then(function(dbs){
    console.log(dbs);
})

const app = express();

app.set('view-engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
    res.send('working...')
});
 
app.listen(3000, function(){
    console.log('Server startet on Port 3000')
})