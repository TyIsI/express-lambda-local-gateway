var express = require('express');
var router = express.Router();
var debug = require('debug')('express-lambda-local-gateway:lambdas');

var path = require('path');

var config = require('./config');

const lambdaLocal = require('lambda-local');

router.use('/', function (req, res, next) {
	if (req.method == 'GET') {
		res.locals.event = req.query;
	} else if (req.method == 'POST') {
		debug("Request Body:");
		debug(req.body);
		if (req.headers['content-type'] == 'application/json' && typeof req.body != 'object') {
			debug("Converting to JSON");
			res.locals.event = JSON.parse(req.body);
		} else {
			res.locals.event = req.body;
		}
	}
	next();
});

router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Express Lambda Local Gateway',
		endpoints: config.endpoints,
		lambdas: config.lambdas
	});
});

router.use('/reload-config', function (req, res, next) {
	debug("Reloading config");
	delete require.cache[require.resolve('./config')];
	config = require('./config');
	res.send({
		result: "RELOADED"
	}).end();
});

router.use('/:mapping_uri', function (req, res, next) {
	let mapping_uri = "/" + req.params.mapping_uri;

	debug("Handling /:mapping_uri", mapping_uri);

	// Send headers
	res.header("Content-Type", "application/json");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, Authorization, Access-Control-Allow-Origin");

	if (req.method == "OPTIONS")
		return res.end();

	if (config.endpoints[mapping_uri] === undefined) return next();
	debug("Gateway Mapping:", config.endpoints[mapping_uri]);

	if (config.endpoints[mapping_uri][req.method] === undefined) return next();
	debug("Method Mapping:", config.endpoints[mapping_uri][req.method]);

	var lambda_name = config.endpoints[mapping_uri][req.method].lambda;
	debug("lambda_name:", lambda_name, "\n");

	var lambda_function = config.lambdas[lambda_name];
	debug("lambda_function:", lambda_function, "\n");

	var handler_mapping = lambda_function.handler.split('.');
	debug("handler_mapping:", handler_mapping, "\n");

	debug('Running ' + mapping_uri);

	// Set execution options
	let execOpts = config.defaults['lambda-local'];
	execOpts.event = res.locals.event
	execOpts.lambdaPath = path.join(__dirname, lambda_name, handler_mapping[0] + '.js');
	execOpts.lambdaHandler = handler_mapping[1];

	debug("Execution Opts:\n", execOpts, "\n");

	// Time keeping
	let start = run_time = Date.now();
	debug("Start:", start);

	// Start request
	lambdaLocal.execute(execOpts).then(function (success) {
		run_time = (Date.now() - start);
		debug("ret:\n", success);
		res.send(JSON.stringify(success)).end();
	}).then(function () {
		debug("Ran for", run_time, "miliseconds");
	}).catch(function (err) {
		debug("Error:\n", err);
		res.status(400);
		res.send(JSON.stringify(err)).end();
	});
});

module.exports = router;