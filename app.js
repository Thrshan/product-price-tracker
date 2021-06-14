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
const dbPath = path.join(__dirname, 'db', 'prices.json');
let price = 0;
let onlineFlag = false;
let userCount = 0;
let getDataInterval = 1000*60*15;
let sendDataInterval = 1000*60*10; //getDataInterval is override by this if someone is online.

setInterval(async () => {
    if (!onlineFlag) {
        await getPrice();
    }
}, getDataInterval); // Update for every 5 sec

function getPrice() {
    return new Promise((resolve) => {
        const url = 'https://www.flipkart.com/google-pixel-4a-just-black-128-gb/p/itm023b9677aa45d?pid=MOBFUSBNAZGY7HQU&lid=LSTMOBFUSBNAZGY7HQUWHTF0C&otracker=clp_banner_1_2.banner.BANNER_pixel-4a-coming-soon-yy34ff3-llo8i3-store_4WXKDU05CEH0';
        fetch(url).then(res => res.text())
            .then(body => {
                var dom = parser.parseFromString(body)
                const priceElement = dom.getElementsByClassName('_16Jk6d');
                if (priceElement.length > 0) {
                    let rawPrice = priceElement[0].innerHTML;
                    price = +rawPrice.replace(/[^0-9]/g, '');
                    // console.log(price);
                }
                updatedData();
                resolve(price);
            });
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
}



// Executes when new client connect
io.on('connection', socket => {
    // console.log(socket.id);
    userCount += 1;
    onlineFlag = true;
    async function sendData() {
        await getPrice();
        let data = await db.retriveData("Pixel", 10);
        socket.emit('updateData', {
            x: data.time,
            y: data.price,
            type: 'scatter'
        });
    }

    console.log("Blam");
    sendData();
    setInterval(() => {
        if (onlineFlag) {
            sendData();
        }
    }, sendDataInterval);

    socket.on('disconnect', () => {
        userCount -= 1;

        console.log("goo");
        if (userCount === 0) {
            onlineFlag = false;
        }
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