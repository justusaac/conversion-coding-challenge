const fs = require('fs');
const path = require('path');

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
function convert_measurement(amount, from_unit, to_unit){
	const attribute = get_attribute(from_unit, to_unit);
	const units = all_measurements[attribute];
	if(!(units && from_unit in units && to_unit in units)){
		return null;
	}
	return amount * (units[from_unit] / units[to_unit]);
}

