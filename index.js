const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodeCouchDb = require('node-couchdb');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const couch = new nodeCouchDb({
    auth: {
        user: 'admin',
        password: 'admin'
    },
    host: '10.1.1.1',
    protocol: 'http',
});

const dbname = 'schueler';
const viewUrl = '_design/v1/_view/id'

const app = express();

app.get('/', function (req, res) {
    const htmlSource = fs.readFileSync("views/main.html", "utf8");
    const styles = fs.readFileSync("views/main.css", "utf8");
    const responseView = new JSDOM(htmlSource);
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];
    const body = doc.getElementsByTagName('body')[0];

    // add styles to document
    style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styles;
    head.appendChild(style);

    res.send(responseView.serialize())  
});

app.get('/lehrer', function (req, res) {
    const htmlSource = fs.readFileSync("views/lehrer/lehrer.html", "utf8");
    const styles = fs.readFileSync("views/lehrer/lehrer.css", "utf8");
    const responseView = new JSDOM(htmlSource);
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];
    const body = doc.getElementsByTagName('body')[0];

    // add styles to document
    style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styles;
    head.appendChild(style);

    couch.get('schueler', '_design/v1/_view/id').then((schueler) => {
        const listDiv = doc.getElementById('content');
        schueler.data.rows.forEach(scolar => {
            let listentry = doc.createElement('p');
            listentry.textContent = scolar.value
            listDiv.appendChild(listentry) 
        });  
        res.send(responseView.serialize())    
    });


});

app.listen(3000, function () {
    console.log('Server startet on Port 3000')
})