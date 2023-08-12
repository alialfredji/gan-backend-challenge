const getDistance = require('./get-distance');

test('Distance between two locations', () => {
	expect(getDistance(52.5200, 13.4050, 48.8566, 2.3522)).toBe(877.46);
});
  
test('Distance between two locations being the same should be 0', () => {
	expect(getDistance(52.5200, 13.4050, 52.5200, 13.4050)).toBe(0);
});
  
test('Missing parameters should return null', () => {
	expect(getDistance(52.5200, 13.4050, 48.8566)).toBe(null);
});
  
test('Distance between North Pole and South Pole', () => {
	expect(getDistance(90, 0, -90, 0)).toBe(20015.09);
});
  
test('Distance between 0°,0° and 0°,180°', () => {
	expect(getDistance(0, 0, 0, 180)).toBe(20015.09);
});