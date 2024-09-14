const test = require('node:test');
const assert = require('assert');

process.env.NODE_ENV = 'test';

const { server, load_measurements, httpserver:oldserver } = require(__dirname+"/../server.js");
oldserver.close();

//Put some fake measurements for testing purposes
server.locals.all_measurements = load_measurements(__dirname);
test.describe('load_measurements', () => {
	assert.deepEqual(server.locals.all_measurements, {
	    a: {
	      1: 0.69,
	      2: 3.34,
	    },
	    b: {
	      x: 3.33,
	      y: -1.2,
	      z: 100,
	    },
	    c: {
	    },
	});
});

test.describe('get_attribute', () => {
	test('compatible units', () => {
		assert.equal(server.locals.get_attribute('1','2'), 'a');
		assert.equal(server.locals.get_attribute('z','x'), 'b');
		assert.equal(server.locals.get_attribute('y','z'), 'b');
	});
	test('incompatible units', () => {
		assert.equal(server.locals.get_attribute('1','-1'), null);
		assert.equal(server.locals.get_attribute('1',null), null);
		assert.equal(server.locals.get_attribute(null,null), null);
	});
});


test.describe('convert_measurement', () => {
	test('correct input', () => {
		function assert_almost_equal(a, b){
			const epsilon = 0.0001;
			if(Math.abs(a-b)>epsilon){
				assert.equal(a,b);
			}
		}
		assert_almost_equal(server.locals.convert_measurement(5, '1', '2'), 1.032934);
		assert_almost_equal(server.locals.convert_measurement(1.23, 'y', 'x'), -0.44324);
		assert_almost_equal(server.locals.convert_measurement(1.23, 'y', 'y'), 1.23);
		assert_almost_equal(server.locals.convert_measurement(100, 'x', 'y'), -277.5);
		assert_almost_equal(server.locals.convert_measurement(6, 'x', 'z'), 0.1998);
		assert_almost_equal(server.locals.convert_measurement(Infinity, 'x', 'y'), -Infinity);
		assert_almost_equal(server.locals.convert_measurement(Infinity, '2', '1'), Infinity);
	});
	test('non-numerical input', () => {
		assert(isNaN(server.locals.convert_measurement(NaN, 'y', 'x')));
		assert(isNaN(server.locals.convert_measurement("foo", '1', '2')));
	});
	test('nonexistent units', () => {
		assert.equal(server.locals.convert_measurement(5, 'y', 'foo'), null);
		assert.equal(server.locals.convert_measurement(-5, null, '1'), null);
	});
	test('incompatible units', () => {
		assert.equal(server.locals.convert_measurement(5, 'y', '1'), null);
	});
	test('bad units and number', () => {
		assert.equal(server.locals.convert_measurement(NaN, null, null), null);
	});
});

const httpserver = server.listen(0, () => {
	const port = httpserver.address().port;
	test.describe('HTTP endpoints', async () => {
		test.after(()=>{httpserver.close()});
		test('/measurements', async () => {
			assert.deepEqual(
				await fetch(`http://localhost:${port}/measurements`).then(response=>response.json()), 
			['a','b','c']);
		});
		test('/units', async () => {
			assert.deepEqual(
				await fetch(`http://localhost:${port}/units/a`).then(response=>response.json()),
			['1','2']);

			assert.deepEqual(
				await fetch(`http://localhost:${port}/units/c`).then(response=>response.json()),
			[]);

			assert.deepEqual(
				await fetch(`http://localhost:${port}/units/madeupstuff`).then(response=>response.json()),
			[]);
		});
		test('/index.html', async () => {
			const page = await fetch(`http://localhost:${port}/index.html`).then(response=>response.text());
			assert(page.trim().toLowerCase().startsWith("<!doctype html>"));
		});
		test('/convert', async () => {
			assert.equal(
				await fetch(`http://localhost:${port}/convert`).then(response=>response.status)
			,400);
			assert.equal(
				await fetch(`http://localhost:${port}/convert?from=1&to=2`).then(response=>response.status)
			,400);
			assert.equal(
				await fetch(`http://localhost:${port}/convert?value=word&from=1&to=2`).then(response=>response.status)
			,400);
			assert.equal(
				await fetch(`http://localhost:${port}/convert?value=21&from=1&to=a`).then(response=>response.status)
			,400);
			assert.equal(
				await fetch(`http://localhost:${port}/convert?from=1&to=2&value=69`).then(response=>response.json())
			,server.locals.convert_measurement(69,1,2));
		});
	});
});