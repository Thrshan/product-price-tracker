require('dotenv').config()
const express = require('express');
const fetch = require('node-fetch');
const DomParser = require('dom-parser');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
var fs = require('fs');

const mail = require(path.join(__dirname, 'mail.js'))
const db = require(path.join(__dirname, 'db-handler.js'))

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new DomParser();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

// setInterval(getPrice,1000*60*15);  // Update for every 15 min
const dbPath = path.join(__dirname, 'db', 'prices.json');
let price = 0;

// setInterval(getPrice, 5000); // Update for every 5 sec
setInterval(getPrice,1000*60*15);

async function getPrice() {
    const url = 'https://www.flipkart.com/google-pixel-4a-just-black-128-gb/p/itm023b9677aa45d?pid=MOBFUSBNAZGY7HQU&lid=LSTMOBFUSBNAZGY7HQUWHTF0C&otracker=clp_banner_1_2.banner.BANNER_pixel-4a-coming-soon-yy34ff3-llo8i3-store_4WXKDU05CEH0';
    await fetch(url).then(res => res.text())
        .then(body => {
            var dom = parser.parseFromString(body)
            const priceElement = dom.getElementsByClassName('_16Jk6d');
            if (priceElement.length > 0) {
                let rawPrice = priceElement[0].innerHTML;
                price = +rawPrice.replace(/[^0-9]/g, '');
                console.log(price);
            }
            updatedData();
        });


}

function updatedData() {
    let time = new Date().toISOString().
    replace(/T/, ' '). // replace T with a space
    replace(/\..+/, '') // delete the dot and everything after

    db.insertData("Pixel", {
        time,
        price
    });

    // fs.readFile(dbPath, 'utf8', function readFileCallback(err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         obj = JSON.parse(data); //now it an object

    //         obj.x.push(time);
    //         obj.y.push(price);

    //         json = JSON.stringify(obj); //convert it back to json
    //         fs.writeFile(dbPath, json, 'utf8', () => {}); // write it back 
    //     }
    // });

}



// Executes when new client connect
io.on('connection', socket => {
    // console.log(socket.id);

    function sendData() {

        db.retriveData("Pixel", 10).then((data)=>{
            
            console.log(data);
            socket.emit('updateData', {
                x: data.time,
                y: data.price,
                type: 'scatter'
            });

        });


    }
    console.log("Blam");
    sendData();
    // setInterval(sendData,1000*60*15);  // Update for every 15 min
    setInterval(sendData, 10000 * 6); // Update for every 10 sec

    socket.on('disconnect', () => {
        console.log("goo");
    });

});


app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
});

// mail.sendEmail(
//     to='thrshan.jeevaraj@gmail.com',
//     subject='duh',
//     body='bruh'
// );