const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("PRAGMA table_info(Categories)", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Columns in Categories:', rows.map(r => r.name));
    }
    db.close();
});
