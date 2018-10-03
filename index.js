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

const SCHUELERDB = 'schueler';
const viewUrl = '_design/v1/_view/id'

function getMainPage() {
    const htmlSource = fs.readFileSync("views/main.html", "utf8");
    const styles = fs.readFileSync("views/main.css", "utf8");
    const responseView = new JSDOM(htmlSource);
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];

    style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styles;
    head.appendChild(style);

    return responseView;
}

const app = express();

app.get('/', function (req, res) {

    const responseView = getMainPage();
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];
    const body = doc.getElementsByTagName('body')[0];



    res.send(responseView.serialize())  
});

app.get('/lehrer', function (req, res) {
    const responseView = getMainPage(); 
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];
    const body = doc.getElementsByTagName('body')[0];



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

app.get('/neuerSchueler', function (req, res) {

    const responseView = getMainPage();
    const doc = responseView.window.document;
    const head = doc.getElementsByTagName('head')[0];
    const body = doc.getElementsByTagName('body')[0];

    const listDiv = doc.getElementById('content');
    const schuelerAnlegenDialog = fs.readFileSync('views/templates/schuelerAnlegen.html', 'utf8')

    let nameInput = doc.createElement('div');
    nameInput.innerHTML = schuelerAnlegenDialog
    listDiv.appendChild(nameInput)

    res.send(responseView.serialize())
    
});


app.listen(3000, function () {
    console.log('Server startet on Port 3000')
})