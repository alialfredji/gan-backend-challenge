/**
 * Calculates the distance between two geographical points on Earth's surface using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of the first point in degrees.
 * @param {number} lon1 - Longitude of the first point in degrees.
 * @param {number} lat2 - Latitude of the second point in degrees.
 * @param {number} lon2 - Longitude of the second point in degrees.
 * 
 * @returns {number} The distance between the two points in kilometers, rounded to two decimal places.
 * 
 * @example
 * const distance = getDistance(52.5200, 13.4050, 48.8566, 2.3522);  // distance between Berlin and Paris
 * console.log(distance);  // Expected output: ~878.69 km (value may vary slightly)
 * 
 * @description
 * This function employs the Haversine formula to compute the shortest distance between 
 * two points on the surface of a sphere. The Earth is not a perfect sphere, but the Haversine 
 * formula offers a very good approximation for most use cases.
 * 
 * The formula involves the following steps:
 * 1. Convert the difference in latitudes and longitudes from degrees to radians.
 * 2. Apply the Haversine formula to calculate the distance `d` between the two points on the unit sphere.
 * 3. Multiply `d` by the Earth's average radius (approximately 6371 km) to get the distance in kilometers.
 * 4. Round the result to two decimal places for a concise output.
 * 
 * Note: This function relies on an external function `deg2rad` to convert degrees to radians. Ensure
 * that this function is defined and accessible in the scope.
 */
module.exports = (lat1, lon1, lat2, lon2) => {
	if ([lat1, lon1, lat2, lon2].some(param => param === undefined)) return null;

	// Define the radius of the Earth in kilometers.
	const R = 6371;

	// Convert the difference in latitudes from degrees to radians.
	const dLat = deg2rad(lat2 - lat1);

	// Convert the difference in longitudes from degrees to radians.
	const dLon = deg2rad(lon2 - lon1);

	// Using the haversine formula to calculate the distance between two points on a sphere.
	// Start by computing the square of half the chord length between the points.
	const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +  // Square of half the chord length (latitude component).
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *  // Adjust for Earth's curvature using the cosine of latitudes.
        Math.sin(dLon/2) * Math.sin(dLon/2)    // Square of half the chord length (longitude component).
    ; 

	// Calculate the angular distance in radians.
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

	// Convert the angular distance from radians to kilometers.
	const distance = R * c;

	// Return the result rounded to two decimal places for precision.
	return parseFloat(distance.toFixed(2));
};

const deg2rad = (deg = 0) => {
	return deg * (Math.PI/180);
};