const fs = require('fs');
const path = require('path');
const express = require('express');

const server = express();

server.use(express.static('scripts'));

//Load all the stored unit conversions into a global object
function load_measurements(directory){
	const results = {};
	for(const filename of fs.readdirSync(directory)){
		const filepath = path.parse(filename);
		if(!(filepath.ext=='.json')){
			continue;
		}
		results[filepath.name] = JSON.parse(
			fs.readFileSync(
				path.join(directory,filename)
			)
		);
	}
	return results;
}
var all_measurements = load_measurements('./units');

//Returns the thing that the two units are measuring, or null if they aren't compatible
function get_attribute(unit1, unit2){
	for(const attribute in all_measurements){
		const units = all_measurements[attribute];
		if(unit1 in units && unit2 in units){
			return attribute;
		}
	}
	return null;
}
//Logic for the conversion
function convert_measurement(amount, from_unit, to_unit){
	const attribute = get_attribute(from_unit, to_unit);
	const units = all_measurements[attribute];
	if(!(units && from_unit in units && to_unit in units)){
		return null;
	}
	return amount * (units[from_unit] / units[to_unit]);
}

//Endpoint for converting units
//Expects `value`, `from`, and `to` in the query string
server.get('/convert', (request, response) => {
	const required_parameters =['value','from','to'];
	const query = request.query;
	if(!required_parameters.every(this.hasOwnProperty, query)){
		response.status(400);
		response.send(`Expected query string parameters ${required_parameters}`);
		return;
	}
	const value = +query.value;
	if(isNaN(value)){
		response.status(400);
		response.send(`Expected \`value\` to contain a number, got ${query.value}`);
		return;
	}
	const result = convert_measurement(value, query.from, query.to);
	if(result === null){
		response.status(400);
		response.send(`Couldn't convert ${query.from} into ${query.to}`);
		return;
	}
	response.send(result.toString());
});

//Endpoint for listing all the supported units for a specific measurement
server.get('/units/:measurement', (request, response) => {
	response.send(JSON.stringify(
		Object.keys(all_measurements[request.params.measurement] ?? {})
	));
});

//Endpoint for listing all the supported things to measure
server.get('/measurements', (request, response) => {
	response.send(JSON.stringify(Object.keys(all_measurements)));
});

//Endpoint for returning a webpage that does conversions
server.get(['/','/index.html'], (request, response) => {
	response.sendFile(__dirname+'/index.html');
});

const port = process.env.PORT || 8888;
server.listen(port, console.log.bind(null, `Listening HTTP on port ${port}`));


