var express = require("express");
var process = require("process");
var bodyParser = require("body-parser");
var path = require("path");
const { Pool, Client } = require("pg");

// Sets up the Express App
// =============================================================
var app = express();
var port = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

var customers = [];
var waitlist = [];

app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registered', function(req, res) {
	res.sendFile(path.join(__dirname, 'registered.html'));
});

app.get('/tables', function(req, res) {
	res.sendFile(path.join(__dirname, 'tables.html'));
});

app.get('/reserve', function(req, res) {
	res.sendFile(path.join(__dirname, 'reservation.html'))
});

app.get('/api/tables', function(req, res) {
	/*for (var i = 0; i < 4; i++) {
		res.json(customers[i]);
	}*/
	return res.json(customers);
});

app.get('/api/waitlist', function(req, res) {
	/*for (var i = 5; i < customers.length; i++) {
		res.json(customers[i]);
	}*/
	return res.json(waitlist);
});

app.post('/api/clear', function(req, res) {
	customers = [];
	waitlist = [];
});

app.post('/api/new', function(req, res) {
	console.log('Works');
	var newCustomer = req.body;
    var connectionString = process.env.DATABASE_URL;

    // Send newCustomer data to databse
    const pool = new Pool({
        connectionString,
    });
    var queryString = `INSERT INTO student( name, phonenumber, email, timeslots) VALUES ('`+
        newCustomer.customerName + `', '` + newCustomer.phoneNumber + `', '` +
        newCustomer.customerEmail + `', '` + newCustomer.level + `', '` +
        newCustomer.timeSlots + `')`;
    console.log(queryString);

    pool.query(queryString, (err, res) => {
        if (err !== undefined) {
            // log the error to console
            console.log("Postgres INSERT error:", err);

            // get the keys for the error
            var keys = Object.keys(err);
            console.log("\nkeys for Postgres error:", keys);

            // get the error position of SQL string
            console.log("Postgres error position:", err.position);
        }
    });
	if (customers.length >= 100) {
		waitlist.push(newCustomer);
	} else {
		customers.push(newCustomer);
	}
	res.json(newCustomer);

});

app.listen(port, function() {
  console.log("App listening on PORT " + port);
});

app.use('/public', express.static(path.join(__dirname, "public")));
