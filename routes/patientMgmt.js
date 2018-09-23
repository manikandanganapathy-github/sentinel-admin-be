var express = require('express')
var mysql = require('mysql')
var cors = require('cors')
var router = express.Router()

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'pass',
	database: 'classicmodels'
});

connection.connect()

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Not intended for viewing.'
	});
});

var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.post('/saveNewPatient', cors(corsOptions), function (req, res, next) {
	var reqObj = req.body;
	connection.query('INSERT INTO sentineladmin.patient_details ( patient_id, created_date, first_name, last_name, dob, gender, phone_number, patient_select) VALUES ( "' + reqObj.PatientID + '", CURDATE(),"' + reqObj.FirstName + '", "' + reqObj.LastName + '", "' + reqObj.DOB + '", "' + reqObj.Gender + '", "' + reqObj.PhoneID + '", "' + reqObj.Select + '")', function (err, rows, fields) {
		if (err) throw err
		res.send(rows);
	})
});

router.post('/saveMultiplePatients', cors(corsOptions), function (req, res, next) {
  var reqJSObj = JSON.parse(req.body.exlJSONData),
  //var reqJSObj = req.body.exlJSONData,
    countRecord = 1;
	console.log("Total Record : " + reqJSObj.length);
	reqJSObj.forEach(record => {
		connection.query('INSERT INTO sentineladmin.patient_details ( patient_id, created_date, first_name, last_name, dob, gender, phone_number, patient_select) VALUES ( "' + record.PatientID + '", CURDATE(),"' + record.FirstName + '", "' + record.LastName + '", "' + record.DOB + '", "' + record.Gender + '", "' + record.PhoneID + '", "' + record.Select + '")', function (err, rows, fields) {
			if (err) throw err
			console.log('Record Inserted ' + (countRecord++) + " / " + reqJSObj.length);
		})
	});
	res.sendStatus(200);
});

router.post('/updatePatient', cors(corsOptions), function (req, res, next) {
	var reqObj = req.body;
	connection.query('SELECT record_id FROM sentineladmin.patient_details WHERE patient_id="' + req.body.PatientID + '"', function (err, rows, fields) {
		if (err) throw err
		var recordID = rows[0].record_id;
		connection.query('UPDATE sentineladmin.patient_details SET first_name="' + reqObj.FirstName + '", last_name= "' + reqObj.LastName + '", dob="' + reqObj.DOB + '", gender="' + reqObj.Gender + '", phone_number="' + reqObj.PhoneID + '" , patient_select="' + reqObj.Select + '" WHERE record_id="' + recordID + '" AND patient_id="' + reqObj.PatientID + '"', function (err, rows, fields) {
			if (err) throw err
			res.send(rows);
			console.log('Response', new Date());
		})
	})

});

router.post('/deletePatient', cors(corsOptions), function (req, res, next) {
	var reqObj = req.body;
	connection.query('SELECT record_id FROM sentineladmin.patient_details WHERE patient_id="' + req.body.PatientID + '"', function (err, rows, fields) {
		if (err) throw err
		var recordID = rows[0].record_id;
		connection.query('UPDATE sentineladmin.patient_details SET patient_select="false" WHERE record_id="' + recordID + '" AND patient_id="' + reqObj.PatientID + '"', function (err, rows, fields) {
			if (err) throw err
			res.send(rows);
			console.log('Response', new Date());
		})
	})

});

router.get('/getAllPatients', cors(corsOptions), function (req, res, next) {
	connection.query('SELECT * FROM sentineladmin.patient_details', function (err, rows, fields) {
		if (err) throw err
		console.log('Records Selected ' + rows.length);
		var respArr = [];
		rows.forEach(record => {
			var resJSON = {};
			resJSON.PatientID = record.patient_id;
			resJSON.CreatedDate = record.created_date;
			resJSON.FirstName = record.first_name;
			resJSON.LastName = record.last_name;
			resJSON.DOB = record.dob;
			resJSON.Gender = record.gender;
			resJSON.PhoneID = record.phone_number;
			resJSON.Select = record.patient_select;
			resJSON.RecordID = record.record_id;
			respArr.push(resJSON);
		});

		res.send(respArr);
	})
});

router.get('/getSysDate', cors(corsOptions), function (req, res, next) {
	connection.query('SELECT now() as "todayDate"', function (err, rows, fields) {
		if (err) throw err
		var resObj = {};
		var tempCD = new Date(rows[0].todayDate);
		resObj.sysCurrDate = tempCD.toLocaleDateString('en-US');
		res.send(resObj);
	})
});


module.exports = router;