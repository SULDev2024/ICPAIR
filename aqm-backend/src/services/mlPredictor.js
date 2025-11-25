// ML Prediction Service
// Simplified prediction logic based on district characteristics and time features

const districtBaselines = {
    // English names (from frontend) -> PM2.5 baseline values
    'alatau': { pm25: 50, pm10: 70, variation: 15 },
    'almaly': { pm25: 65, pm10: 75, variation: 18 },
    'auezov': { pm25: 75, pm10: 85, variation: 20 },
    'bostandyk': { pm25: 55, pm10: 60, variation: 12 },
    'medeu': { pm25: 48, pm10: 55, variation: 10 },
    'nauryzbay': { pm25: 70, pm10: 80, variation: 18 },
    'turksib': { pm25: 85, pm10: 95, variation: 22 },
    'zhetysu': { pm25: 80, pm10: 90, variation: 20 }
};

/**
 * Predict PM2.5 value for a given date and district
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {string} district - District name in English
 * @returns {number} Predicted PM2.5 value
 */
function predictPM25(dateStr, district) {
    const districtKey = district.toLowerCase();
    const baseline = districtBaselines[districtKey];

    if (!baseline) {
        console.warn(`Unknown district: ${district}, using default`);
        return 60; // Default fallback
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const month = date.getMonth(); // 0 = January, 11 = December
    const hour = date.getHours();

    // Time-based adjustments
    let prediction = baseline.pm25;

    // Winter months (Nov-Feb) have higher pollution
    if (month >= 10 || month <= 1) {
        prediction += 15;
    }
    // Summer months (Jun-Aug) have lower pollution
    else if (month >= 5 && month <= 7) {
        prediction -= 10;
    }

    // Weekday vs weekend (weekends slightly better)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        prediction -= 5;
    }

    // Add some realistic daily variation
    const dayHash = date.getDate() + month * 31;
    const variation = (Math.sin(dayHash) * baseline.variation);
    prediction += variation;

    // Ensure reasonable bounds
    prediction = Math.max(10, Math.min(150, prediction));

    return Math.round(prediction * 10) / 10; // Round to 1 decimal
}

module.exports = {
    predictPM25
};
