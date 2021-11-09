const addressRoutes = (app, fs, connection) => {

    const con = connection.con;
    const IPCIDR = require("ip-cidr");

    // regex to filter for IPv4 CIDR block
    const ipAddressCIDR = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$/;

    // regex to filter for IPv4 address
    const ipAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    //=======================
    //    POST /addresses			
    //=======================
    app.post('/addresses', (req, res) => {
        try {
            if (req.body.address) {
                // check for valid IPv4 CIDR block
                if (!ipAddressCIDR.test(req.body.address)) {
                    res.status(400).send("Not a valid IPv4 CIDR block!")
                } else {
                    // break IPv4 CIDR block into cidr object with all individual addresses
                    const address = req.body.address;
                    const cidr = new IPCIDR(address);

                    //used to hold every address as values portion of SQL query
                    var allAddress = [];

                    // build values portion of query with all ip addresses in CIDR block
                    cidr.loop(ip => allAddress.push(("('" + ip.address + "', " + "'available')"))
                        , { type: "addressObject" });

                    // join allAddress array into one string
                    allAddressString = allAddress.join();

                    // insert allAddress into ip_address table while ignoring addresses that already exists
                    con.connect(function () {
                        con.query(`INSERT IGNORE INTO ip_address (address, status) values ${allAddressString};`,
                            function (err, result, fields) {
                                if (err) {
                                    res.status(500).send("Internal server error");
                                    console.log(err);
                                }
                                if (result) res.status(201).send("Successfully created addresses in IPv4 CIDR block: " + req.body.address);
                                if (fields) console.log(fields);
                            });
                    });
                };
            } else {
                res.status(400).send("Invalid request message framing");
            }
        } catch (exception) {
            res.status(500).send("Internal server error");
            console.log(exception);
        };
    });

    //========================
    //     GET /addresses			
    //========================
    app.get('/addresses', (req, res) => {
        try {
            // return all addresses from ip_address table
            con.connect(function () {
                con.query(`SELECT * FROM ip_address`, function (err, result, fields) {
                    if (err) {
                        res.status(500).send("Internal server error");
                        console.log(err);
                    }
                    if (result) res.status(200).send(result);
                });
            });
        } catch (exception) {
            res.status(500).send("Internal server error");
            console.log(exception);
        };
    });

    //==========================================
    //     PUT /addresses/{address}/acquire			
    //==========================================
    app.put('/addresses/:address/acquire', function (req, res) {
        try {
            // Check for valid IPv4 address
            if (!ipAddress.test(req.params.address)) {
                res.status(400).send("Not a valid IP address!")
            } else {
                // Update status of addresses/{address} to acquired
                con.connect(function () {
                    con.query(`UPDATE ip_address SET status='acquired' WHERE address=${con.escape(req.params.address)}`,
                        function (err, result, fields) {
                            if (err) {
                                res.status(500).send("Internal server error");
                                console.log(err);
                            }
                            if (result) res.status(200).send("Successfully updated the following IPv4 address to acquired: " + req.params.address);
                            if (fields) console.log(fields);
                        });
                });
            }
        } catch (exception) {
            res.status(500).send("Internal server error");
            console.log(exception)
        };
    });

    //============================================
    //     PUT /addresses/{address}/available			
    //============================================
    app.put('/addresses/:address/available', function (req, res) {
        try {
            // Check for valid IPv4 address
            if (!ipAddress.test(req.params.address)) {
                res.status(400).send("Not a valid IP address!")
            } else {
                // Update status of addresses/{address} to available
                con.connect(function () {
                    con.query(`UPDATE ip_address SET status='available' WHERE address=${con.escape(req.params.address)}`,
                        function (err, result, fields) {
                            if (err) {
                                res.status(500).send("Internal server error");
                                console.log(err);
                            }
                            if (result) res.status(200).send("Successfully updated the following IPv4 address to available: " + req.params.address);
                            if (fields) console.log(fields);
                        });
                });
            }
        } catch (exception) {
            res.status(500).send("Internal server error");
            console.log(exception)
        };
    });
};

module.exports = addressRoutes;