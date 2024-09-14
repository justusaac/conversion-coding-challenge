## How to run
After downloading or cloning this repository:
1. Make sure you have Node.js installed. I created and tested this with Node.js version 20.11.0; if you are having issues you can try that version.
2. Open a command prompt in the root directory of the project (same as where this file is located)
3. Run the command `npm install` to download all the dependencies
4. Run the command `node server.js` to run an HTTP server
5. Access the endpoints listed below at the port it printed out in the previous step (by default 8888) in your browser or another HTTP client, for example: <http://localhost:8888/index.html>
Optional: Run `npm run test` to test the server and its functionality

## Endpoints
- `/` or `/index.html`: Returns a web page that allows you to interactively use the other endpoints
- `/measurements`: Returns a JSON list of all the supported types of measurement (length, mass, etc.)
- `/units/{measurement}`: Returns a JSON list of all the supported units for the specified type of measurement
- `/convert?value={number}&from={unit}&to={unit}`: Returns the number of `to` units equivalent to `value` units of `from`, or an error message if the units are unsupported or incompatible, or if the query string parameters are incorrect