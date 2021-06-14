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
        // console.log('Connected to the in-memory SQlite database.');
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
        // console.log('Close the database connection.');
    });
}

function retriveData(tableName, noOfRows) {
    return new Promise((resolve, reject) => {
        let data = {time:[],price:[]};
        let db = new sqlite3.Database('./db/productPrice.db');
        let i = 1;
        let sql = `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT ${noOfRows}`;
    
        db.all(sql, [], (err, rows) => { // even after having this function as async, this part is saperate loop
            if (err) {
                throw err;
            }
            for (row of rows) {
                data.time.push(row.time);
                data.price.push(row.price);
            }
            resolve(data);
        });
        
        db.close();



    });
}