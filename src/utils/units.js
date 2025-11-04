/**
 * Unit conversion utilities
 */

/**
 * Convert kilometers to miles
 * @param {number} km - Distance in kilometers
 * @returns {number} Distance in miles
 */
export function kmToMiles(km) {
  return km * 0.621371;
}

/**
 * Convert meters to feet
 * @param {number} meters - Elevation in meters
 * @returns {number} Elevation in feet
 */
export function metersToFeet(meters) {
  return meters * 3.28084;
}

/**
 * Format distance in miles with appropriate precision
 * @param {number} km - Distance in kilometers
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted distance with "mi" unit
 */
export function formatDistance(km, decimals = 1) {
  const miles = kmToMiles(km);
  return `${miles.toFixed(decimals)} mi`;
}

/**
 * Format elevation in feet
 * @param {number} meters - Elevation in meters
 * @returns {string} Formatted elevation with "ft" unit
 */
export function formatElevation(meters) {
  const feet = metersToFeet(meters);
  return `${Math.round(feet)} ft`;
}

