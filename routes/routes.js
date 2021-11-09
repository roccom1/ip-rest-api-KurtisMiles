const addressRoutes = require('./addresses');
const connection = require('../db_connect');

const appRouter = (app, fs) => {

    // home page route
    app.get('/', (req, res) => {
        res.send('Welcome to the ip-address restful api server');
    });

    // routes for /addresses
    addressRoutes(app, fs, connection);

};

module.exports = appRouter;