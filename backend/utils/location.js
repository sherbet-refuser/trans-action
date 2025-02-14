function getLocation(ip) {
  const geoip = require('geoip-lite');
  const geo = geoip.lookup(ip);
  if (geo) {
    const { city, region, country } = geo;
    let locationStr = city ? `${city}` : 'Unknown City';
    if (region) locationStr += `, ${region}`;
    locationStr += `, ${country || 'Unknown Country'}`;
    return locationStr;
  }
  return 'Location not available';
}

module.exports = { getLocation };
