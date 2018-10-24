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

function addstyles(pageDom, stylepath) {
    const styles = fs.readFileSync(stylepath, 'utf8');
    const head = pageDom.window.document.getElementsByTagName('head')[0];

    const style = pageDom.window.document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styles;
    head.appendChild(style);
}

function getMainPage() {
    const htmlSource = fs.readFileSync("views/main.html", "utf8");
    const menuHTML = fs.readFileSync("views/templates/mainMenu.html", "utf8");

    const responseView = new JSDOM(htmlSource);
    const doc = responseView.window.document;
    addstyles(responseView, "views/main.css");

    const mainMenu = doc.getElementById('menu');
    mainMenu.classList = "w3-sidebar w3-bar-block";
    mainMenu.innerHTML = menuHTML;
    addstyles(responseView, "views/templates/mainMenu.css")

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
    addstyles(responseView, "views/templates/lehrer.css");
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

app.get('/schuelerAnlegen', function (req, res) {


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