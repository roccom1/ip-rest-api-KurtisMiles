
const mysql = require('mysql');
// const { builtinModules } = require('node:module');

const con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "lam144",
    database: "ip_database_kurtismiles"
});

con.connect(function (err) {
    if (err) throw err;
    else { console.log("Connected!") };
});

module.exports = {
    mysql: mysql,
    con: con
};
