const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const zlib = require('zlib');

const getDistance = require('./get-distance');

/**
 * Initializes and runs an Express API server.
 * 
 * @param {Object} config - The server's configuration.
 * @param {string} config.port - The port the server will run on.
 * @param {string} config.host - The host address of the server.
 * @param {string} config.protocol - The protocol used (typically 'http' or 'https').
 * @returns {Promise} Resolves once the server is up and running.
 */
module.exports.init = ({ port, host, protocol }) => new Promise((resolve) => {
	const cities = JSON.parse(zlib.gunzipSync(fs.readFileSync('addresses.json.gz')).toString()); // Load city data from JSON file
	const areaJobs = {}; // Object to store jobs related to the /area endpoint
	const app = express();
	const hardcodedAuthToken = 'dGhlc2VjcmV0dG9rZW4=';
	const hardcodedJobId = '2152f96f-50c7-4d76-9e18-f7033bd14428';
	
	// Body parser middleware to handle JSON requests.
	app.use(bodyParser.json());
    
	// Middleware for authentication.
	// Checks if the provided authorization header contains the correct bearer token.
	app.use((req, res, next) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).send('Authentication required');
		}

		const [authType, authToken] = authHeader.split(' ');
		if (!authType || (authType.toLowerCase() !== 'bearer')) {
			return res.status(401).send('Authentication required');
		}

		if (authToken !== hardcodedAuthToken) {
			return res.status(401).send('Authentication required');
		}

		next();
	});
	
	// Endpoint to fetch cities based on a specific tag and active status.
	app.get('/cities-by-tag', (req, res) => {
		const tag = req.query.tag;
		const isActive = req.query.isActive === 'true';
		const filteredCities = cities.filter(city => city.tags.includes(tag) && city.isActive === isActive);
		res.json({ cities: filteredCities });
	});
	
	// Endpoint to calculate the distance between two cities identified by their GUIDs.
	app.get('/distance', (req, res) => {
		const cityFrom = cities.find(city => city.guid === req.query.from);
		const cityTo = cities.find(city => city.guid === req.query.to);
    
		if(!cityFrom || !cityTo) {
			return res.status(400).send('City not found');
		}
		
		const distance = getDistance(
			cityFrom.latitude,
			cityFrom.longitude,
			cityTo.latitude,
			cityTo.longitude
		);
        
		res.json({
			from: cityFrom,
			to: cityTo,
			unit: 'km',
			distance: distance
		});
	});
	
	// Endpoint to stream the entire addresses.json data.
	app.get('/all-cities', (req, res) => {
		const gzipStream = zlib.createGunzip();
		const fileStream = fs.createReadStream('addresses.json.gz');
        
		res.setHeader('Content-Type', 'application/json');
		fileStream.pipe(gzipStream).pipe(res);
	});
	
	// Endpoint to start a simulated long-running job that finds cities within a certain distance of a given city
	// It responds immediately with a jobId and processes the job asynchronously
	app.get('/area', (req, res) => {
		res.status(202).json({
			resultsUrl: `${protocol}://${host}:${port}/area-result/${hardcodedJobId}`
		});

		if (areaJobs[hardcodedJobId]) return; // Job already exists

		setTimeout(() => {
			areaJobs[hardcodedJobId] = {
				status: 'processing',
				data: null
			};

			const cityGuid = req.query.from;
			const distance = parseFloat(req.query.distance);
		
			const city = cities.find(city => city.guid === cityGuid);
			if (!city) {
				areaJobs[hardcodedJobId].status = 'failed';
			}
	
			const nearbyCities = cities.filter(otherCity => {
				if (otherCity.guid === city.guid) return false; // Skip the source city
				return getDistance(city.latitude, city.longitude, otherCity.latitude, otherCity.longitude) <= distance;
			});
			areaJobs[hardcodedJobId].status = 'completed';
			areaJobs[hardcodedJobId].data = nearbyCities;
		});
	});
    
	// Endpoint to check the status/result of a previously requested area job
	app.get('/area-result/:jobId', (req, res) => {
		const job = areaJobs[req.params.jobId];
		if (!job) return res.status(404).send('Job not found');
		if (job.status === 'processing') return res.status(202).send('Still processing');
		if (job.status === 'failed') return res.status(500).send('Job failed');
		if (job.status === 'completed') return res.status(200).json({ cities: job.data });
	});
	
	// Start the Express server
	app.listen(port, () => {
		console.log(`API server running at ${protocol}://${host}:${port}`);
		resolve();
	});
});
