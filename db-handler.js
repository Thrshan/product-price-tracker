const sqlite3 = require('sqlite3').verbose();

module.exports = {
    insertData,
    retriveData
};


function insertData(tableName, data) {
    // open database in memory
    let db = new sqlite3.Database('./db/productPrice.db', (err) => {
        if (err) {
            return console.log(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (time TEXT, price INTEGER)`);

    db.run(`INSERT INTO ${tableName}(time, price) VALUES(?,?)`, [data.time, data.price], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });



    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

let data = {time:[], price:[]};
async function retriveData(tableName, noOfRows) {
    // open the database
    console.log("One" + data.time.length);
    console.log("Two" + data.time.length);
    let db = new sqlite3.Database('./db/productPrice.db');
    let i = 1;
    let sql = `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT ${noOfRows}`;

    db.all(sql, [], (err, rows) => { // even after having this function as async, this part is saperate loop
        if (err) {
            throw err;
        }
        data = {time:[],price:[]};
        for (row of rows) {
            i += 1;
            // console.log(i);
            console.log("Three" + data.time.length);
            data.time.push(row.time);
            // console.log(row.time);
            data.price.push(row.price);
            // console.log(data.price);
        }
        console.log("Four" + data.time.length);
    });

    // close the database connection
    db.close();
    console.log("FIVE" + data.time.length);
    return data;
}