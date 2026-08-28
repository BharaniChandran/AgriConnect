// Coordinates of major Maharashtra APMC Hubs & Districts (lat, lon)
export const MH_APMC_COORDINATES = {
  // Nashik District Hubs
  'nashik': [19.9975, 73.7898],
  'pimpalgaon': [20.1667, 73.9833],
  'lasalgaon': [20.1472, 74.2256],
  'yeola': [20.0422, 74.4878],
  'malegaon': [20.5539, 74.5298],
  'sinnar': [19.8456, 73.9961],
  'dindori': [20.1983, 73.8344],
  'kalwan': [20.4900, 73.9700],
  'satana': [20.5894, 74.2044],
  'chandwad': [20.3275, 74.2403],

  // Pune & Western Maharashtra Hubs
  'pune': [18.5204, 73.8567],
  'gultekdi': [18.4967, 73.8655],
  'manchar': [19.0064, 73.9458],
  'junnar': [19.2081, 73.8767],
  'shirur': [18.8282, 74.3756],
  'baramati': [18.1519, 74.5772],

  // Mumbai & Konkan APMCs
  'mumbai': [19.0760, 72.8777],
  'vashi': [19.0771, 72.9986],
  'navi mumbai': [19.0330, 73.0297],
  'kalyan': [19.2403, 73.1305],
  'thane': [19.2183, 72.9781],

  // Vidarbha & Marathwada APMCs
  'nagpur': [21.1458, 79.0882],
  'kalamna': [21.1738, 79.1418],
  'amravati': [20.9374, 77.7796],
  'akola': [20.7002, 77.0082],
  'kolhapur': [16.7050, 74.2433],
  'sangli': [16.8524, 74.5815],
  'satara': [17.6805, 74.0183],
  'ahmednagar': [19.0952, 74.7480],
  'shrirampur': [19.6175, 74.6561],
  'rahuri': [19.3900, 74.6500],
  'jalgaon': [21.0077, 75.5626],
  'dhule': [20.9042, 74.7749],
  'chhatrapati sambhajinagar': [19.8762, 75.3433],
  'aurangabad': [19.8762, 75.3433],
  'jalna': [19.8410, 75.8864],
  'latur': [18.4088, 76.5604],
  'nanded': [19.1383, 77.3210],
  'solapur': [17.6599, 75.9064]
};

export function geocodeLocation(locationStr) {
  if (!locationStr) return [19.9975, 73.7898]; // default Nashik
  const lower = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(MH_APMC_COORDINATES)) {
    if (lower.includes(key)) return coords;
  }
  return [19.7515, 75.7139]; // Default Maharashtra center
}

export function calculateDistanceKm(loc1, loc2) {
  const [lat1, lon1] = typeof loc1 === 'string' ? geocodeLocation(loc1) : (loc1 || [19.9975, 73.7898]);
  const [lat2, lon2] = typeof loc2 === 'string' ? geocodeLocation(loc2) : (loc2 || [19.9975, 73.7898]);

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDist = R * c;

  // Road winding factor (1.25x)
  const roadDist = Math.max(5.0, Math.round(directDist * 1.25));
  return roadDist;
}

export function estimateTransitDuration(distanceKm) {
  // Average commercial agro-logistics speed: 45 km/h
  const hours = distanceKm / 45;
  if (hours < 1) {
    const mins = Math.max(15, Math.round(hours * 60));
    return `~${mins} mins`;
  }
  const fullHours = Math.floor(hours);
  const remainingMins = Math.round((hours - fullHours) * 60);
  return remainingMins > 0 ? `~${fullHours}h ${remainingMins}m` : `~${fullHours}h`;
}