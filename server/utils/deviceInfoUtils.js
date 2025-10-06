export async function getCountryFromIP(ip) {
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        return { country: data.country, region: data.regionName, city: data.city }
    } catch (err) {
        console.error('Failed to get country:', err);
        return null;
    }
}