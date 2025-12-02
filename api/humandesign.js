/**
 * Human Design API Endpoint
 * Calculates Human Design chart based on birth information
 */

const { calculateHumanDesign } = require('../utils/humanDesignCalculator.cjs');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { birthDate, birthTime } = req.body;

    if (!birthDate || !birthTime) {
      return res.status(400).json({
        error: 'Missing required fields: birthDate and birthTime are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return res.status(400).json({
        error: 'Invalid birthDate format. Expected YYYY-MM-DD'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birthTime)) {
      return res.status(400).json({
        error: 'Invalid birthTime format. Expected HH:MM'
      });
    }

    console.log(`Calculating Human Design for: ${birthDate} at ${birthTime}`);

    // Parse birth date
    const parsedBirthDate = new Date(birthDate);

    // Calculate Human Design
    const humanDesign = calculateHumanDesign(parsedBirthDate, birthTime);

    console.log('Human Design calculated successfully:', {
      type: humanDesign.type,
      strategy: humanDesign.strategy,
      authority: humanDesign.authority,
      profile: humanDesign.profile
    });

    // Return simplified result (without full planetary data to reduce payload)
    const response = {
      type: humanDesign.type,
      strategy: humanDesign.strategy,
      authority: humanDesign.authority,
      profile: humanDesign.profile,
      centers: humanDesign.centers,
      // Optionally include key gates
      sunGate: humanDesign.consciousActivations.Sun.gate,
      earthGate: humanDesign.consciousActivations.Earth.gate,
      moonGate: humanDesign.consciousActivations.Moon.gate
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating Human Design:', error);
    return res.status(500).json({
      error: 'Failed to calculate Human Design',
      message: error.message
    });
  }
};
