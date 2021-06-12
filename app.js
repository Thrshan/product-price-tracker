const express = require('express');
const fetch = require('node-fetch');
const  DomParser = require('dom-parser');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
var fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3000;
const parser = new DomParser();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

var priceData = {x:[], y:[]};

let price = 29999;
getPrice();

async function getPrice(){
    const url = 'https://www.flipkart.com/google-pixel-4a-just-black-128-gb/p/itm023b9677aa45d?pid=MOBFUSBNAZGY7HQU&lid=LSTMOBFUSBNAZGY7HQUWHTF0C&otracker=clp_banner_1_2.banner.BANNER_pixel-4a-coming-soon-yy34ff3-llo8i3-store_4WXKDU05CEH0';
    return await fetch(url)
                .then(res => res.text())
                .then(body => {
                                var dom = parser.parseFromString(body)
                                const priceElement = dom.getElementsByClassName('_16Jk6d');
                                if( priceElement.length > 0){
                                    let rawPrice = priceElement[0].innerHTML;
                                    price = +rawPrice.replace(/[^0-9]/g, '');
                                    // console.log(price);
                                }       
                            });
    
}

function updatedData() {
    let time = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after

    
    const jsonPath = path.join(__dirname, 'db', 'prices.json');

    // try {
    // if (fs.existsSync(jsonPath)) {
    //     console.log("File exists.")
    // } else {
    //     console.log("File does not exist.")
    //     json = JSON.stringify(priceData); //convert it back to json
    //     fs.writeFile(jsonPath, json, 'utf8', callback); // write it back 
    // }
    // } catch(err) {
    // console.error(err)
    // }

    fs.readFile(jsonPath, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        obj = JSON.parse(data); //now it an object

        obj.x.push(time);
        getPrice();
        obj.y.push(price);

        priceData = obj;

        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(jsonPath, json, 'utf8', ()=>{}); // write it back 
    }});
        
    }
    
// Executes when new client connect
io.on('connection', socket => {
    // console.log(socket.id);
    function sendUpdatedData() {
        updatedData();

        socket.emit('updateData', {
        x: priceData.x,
        y: priceData.y,
        type: 'scatter'
      });
    }
    sendUpdatedData();
    setInterval(sendUpdatedData,1000*60*15);  // Update for every 15 min
    // setInterval(sendUpdatedData,5000);  // Update for every 5 sec
});


app.get('/', (req, res)=>{
    res.sendFile('index.html');
});

app.get('/home', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




server.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`);
});

