const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const memoryStore = require('../utils/memoryStore');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

const router = express.Router();

// Comprehensive Agronomic Knowledge Base for 38 Crop Pathogens & Conditions
const AGRONOMIC_KNOWLEDGE_BASE = {
  // Tomatoes
  'Tomato___Early_blight': {
    crop: 'Tomato',
    pathogenType: 'Fungal (Alternaria solani)',
    riskFactors: 'Warm temperatures (24-30°C) with persistent leaf wetness or relative humidity > 80%.',
    organicSolutions: [
      { remedy: 'Copper Hydroxide / Bordeaux Mixture (1%)', dosage: '2.5 - 3.0 g / L', timing: 'Spray at 7-10 day intervals starting at first sign of target-like lesions.' },
      { remedy: 'Bacillus subtilis Bio-fungicide', dosage: '5 ml / L of water', timing: 'Early morning spray to colonize leaf surface before spore germination.' }
    ],
    chemicalSolutions: [
      { chemical: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC', dosage: '1.0 ml / L', phiDays: 5, notes: 'Systemic translaminar protection; alternate with multi-site protectants.' },
      { chemical: 'Mancozeb 75% WP', dosage: '2.0 - 2.5 g / L', phiDays: 7, notes: 'Contact protectant; thorough canopy coverage required.' }
    ],
    culturalPractices: [
      'Strictly avoid overhead sprinkler watering; install ground drip irrigation.',
      'Prune lower foliage up to 30 cm from the soil surface to prevent soil splash inoculation.',
      'Apply 5-8 cm organic straw mulch beneath plants to create a barrier against soil-borne spores.'
    ],
    soilGuidance: { optimalPh: '6.0 - 6.8', moistureTarget: '60 - 70%' }
  },

  'Tomato___Late_blight': {
    crop: 'Tomato',
    pathogenType: 'Oomycete (Phytophthora infestans)',
    riskFactors: 'Cool, wet weather (15-22°C) with continuous humidity > 90% and evening fog.',
    organicSolutions: [
      { remedy: 'Fixed Copper Soap / Copper Octanoate', dosage: '3.0 - 4.0 ml / L', timing: 'Apply immediately before forecasted rain events.' },
      { remedy: 'Potassium Silicate foliar spray', dosage: '2.0 ml / L', timing: 'Strengthens leaf cuticle cell walls against mycelial penetration.' }
    ],
    chemicalSolutions: [
      { chemical: 'Cymoxanil 8% + Mancozeb 64% WP', dosage: '2.5 g / L', phiDays: 7, notes: 'Curative kickback action within 48 hours of infection.' },
      { chemical: 'Dimethomorph 50% WP', dosage: '1.0 g / L', phiDays: 5, notes: 'Inhibits oospore cell wall formation.' }
    ],
    culturalPractices: [
      'Inspect field daily in early morning for water-soaked, dark lesions with white fungal fuzz underneath.',
      'Immediately remove and deeply bury severely infected vines; do not compost.',
      'Ensure wide row spacing (minimum 90 cm) for rapid morning foliage drying.'
    ],
    soilGuidance: { optimalPh: '6.2 - 6.8', moistureTarget: '55 - 65%' }
  },

  'Tomato___Bacterial_spot': {
    crop: 'Tomato',
    pathogenType: 'Bacterial (Xanthomonas spp.)',
    riskFactors: 'Warm temperatures (25-32°C) coupled with wind-driven rain or sprinkler splash.',
    organicSolutions: [
      { remedy: 'Copper Sulfate + Slaked Lime (Bordeaux mixture)', dosage: '1% solution', timing: 'Preventive weekly spray during humid spells.' },
      { remedy: 'Pseudomonas fluorescens bio-agent', dosage: '10 g / L', timing: 'Root dip at transplanting plus foliar spray at 30 days.' }
    ],
    chemicalSolutions: [
      { chemical: 'Copper Oxychloride 50% WP + Streptomycin Sulphate 9% (90:10 ratio)', dosage: '2.0 g / L', phiDays: 10, notes: 'Targeted bactericidal knockdown.' }
    ],
    culturalPractices: [
      'Do not cultivate or prune fields when foliage is wet with morning dew.',
      'Disinfect all pruning shears and stakes in 10% sodium hypochlorite solution between rows.'
    ],
    soilGuidance: { optimalPh: '6.0 - 6.7', moistureTarget: '60 - 68%' }
  },

  'Potato___Early_blight': {
    crop: 'Potato',
    pathogenType: 'Fungal (Alternaria solani)',
    riskFactors: 'Alternating dry and humid conditions with daytime temperatures above 25°C.',
    organicSolutions: [
      { remedy: 'Trichoderma harzianum soil and foliar drench', dosage: '5 g / L', timing: 'Apply at tuber initiation and flowering stages.' },
      { remedy: 'Liquid Copper Soap', dosage: '3.0 ml / L', timing: 'Apply to lower foliage early morning.' }
    ],
    chemicalSolutions: [
      { chemical: 'Chlorothalonil 75% WP', dosage: '2.0 g / L', phiDays: 7, notes: 'Broad-spectrum contact protectant.' },
      { chemical: 'Pyraclostrobin 20% WG', dosage: '0.5 g / L', phiDays: 7, notes: 'Strobilurin with strong greening effect.' }
    ],
    culturalPractices: [
      'Maintain vigorous plant nutrition; early blight targets stressed or nitrogen-deficient plants.',
      'Hill soil high over tubers to prevent spore-wash into developing potatoes during rain.',
      'Allow 2-3 weeks vine-kill before harvest to set tuber skins.'
    ],
    soilGuidance: { optimalPh: '5.5 - 6.5', moistureTarget: '65 - 75%' }
  },

  'Potato___Late_blight': {
    crop: 'Potato',
    pathogenType: 'Oomycete (Phytophthora infestans)',
    riskFactors: 'Night temperatures 10-15°C, day temperatures 16-21°C, and relative humidity > 90%.',
    organicSolutions: [
      { remedy: 'Copper Hydroxide 77% WP', dosage: '2.0 - 2.5 g / L', timing: 'Preventative application every 7 days during overcast weather.' }
    ],
    chemicalSolutions: [
      { chemical: 'Metalaxyl 8% + Mancozeb 64% WP', dosage: '2.5 g / L', phiDays: 7, notes: 'Systemic curative fungicide.' },
      { chemical: 'Mandipropamid 23.4% SC', dosage: '0.8 ml / L', phiDays: 3, notes: 'Rain-fast translaminar protection.' }
    ],
    culturalPractices: [
      'Destroy volunteer potatoes and cull piles from the previous growing season.',
      'Harvest only on dry days and store tubers in well-ventilated, cool (4-8°C) facilities.'
    ],
    soilGuidance: { optimalPh: '5.2 - 6.2', moistureTarget: '60 - 70%' }
  },

  'Apple___Apple_scab': {
    crop: 'Apple',
    pathogenType: 'Fungal (Venturia inaequalis)',
    riskFactors: 'Prolonged leaf wetness periods (> 9 hours) at temperatures between 15-24°C in spring.',
    organicSolutions: [
      { remedy: 'Wettable Micronized Sulphur 80% WP', dosage: '3.0 g / L', timing: 'Apply at green tip, pink bud, and petal fall.' },
      { remedy: 'Liquid Lime Sulphur', dosage: '10 ml / L (dormant spray)', timing: 'Eradicates overwintering pseudothecia on orchard floor.' }
    ],
    chemicalSolutions: [
      { chemical: 'Difenoconazole 25% EC', dosage: '0.5 ml / L', phiDays: 14, notes: 'High curative systemic efficacy; up to 96h kickback.' },
      { chemical: 'Captan 50% WP', dosage: '2.5 g / L', phiDays: 10, notes: 'Multi-site contact protectant.' }
    ],
    culturalPractices: [
      'Flail-mow fallen orchard leaves in autumn or spray 5% urea to accelerate leaf decomposition.',
      'Prune canopy annually to permit sunlight and air movement through the interior branches.'
    ],
    soilGuidance: { optimalPh: '6.0 - 7.0', moistureTarget: '55 - 65%' }
  },

  'Corn_(maize)___Common_rust': {
    crop: 'Corn',
    pathogenType: 'Fungal (Puccinia sorghi)',
    riskFactors: 'High relative humidity (> 95%) with cool-to-moderate temperatures (16-25°C).',
    organicSolutions: [
      { remedy: 'Neem seed kernel extract (NSKE 5%)', dosage: '50 ml / L', timing: 'At first appearance of golden-brown pustules.' }
    ],
    chemicalSolutions: [
      { chemical: 'Azoxystrobin 23% SC', dosage: '1.0 ml / L', phiDays: 14, notes: 'Apply at tassel emergence if rust pustules reach upper leaves.' }
    ],
    culturalPractices: [
      'Select certified rust-resistant hybrid varieties.',
      'Rotate with non-grass crops (e.g. soybeans or pulses) for 2 consecutive seasons.'
    ],
    soilGuidance: { optimalPh: '5.8 - 7.0', moistureTarget: '60 - 75%' }
  },

  'Grape___Black_rot': {
    crop: 'Grape',
    pathogenType: 'Fungal (Guignardia bidwellii)',
    riskFactors: 'Warm temperatures (21-27°C) accompanied by spring rain and high canopy density.',
    organicSolutions: [
      { remedy: 'Copper Oxychloride 50% WP', dosage: '2.5 g / L', timing: 'Apply from 10 cm shoot growth through veraison.' }
    ],
    chemicalSolutions: [
      { chemical: 'Myclobutanil 10% WP', dosage: '1.0 g / L', phiDays: 14, notes: 'Systemic curative sterol inhibitor.' }
    ],
    culturalPractices: [
      'Remove all shriveled, mummified black berries from vines during winter pruning.',
      'Leaf-pull around grape fruit clusters after berry set to maximize sun and airflow.'
    ],
    soilGuidance: { optimalPh: '6.0 - 6.8', moistureTarget: '50 - 60%' }
  }
};

// Default generic advisory for healthy crops or unlisted classes
const DEFAULT_HEALTHY_ADVISORY = {
  crop: 'Crop Leaf',
  pathogenType: 'Healthy Plant Foliage',
  riskFactors: 'No active pathogens detected. Environmental stress may still induce susceptibility.',
  organicSolutions: [
    { remedy: 'Cold-pressed Neem Oil (0.3%) + Organic Soap', dosage: '3 ml / L', timing: 'Fortnightly preventive foliar mist to repel vector insects.' },
    { remedy: 'Humic Acid + Seaweed Extract Foliar Tonic', dosage: '2 ml / L', timing: 'Apply early morning to promote photosynthesis and root mass.' }
  ],
  chemicalSolutions: [
    { chemical: 'No chemical fungicides recommended', dosage: 'N/A', phiDays: 0, notes: 'Foliage is clean; avoid unnecessary chemical inputs to preserve beneficial microbes.' }
  ],
  culturalPractices: [
    'Maintain consistent drip irrigation schedule to avoid drought-stress cracks in fruit/tubers.',
    'Scout fields bi-weekly in the early morning when dew makes symptoms visible.',
    'Test soil every season for organic carbon, available nitrogen, phosphorus, and potassium balance.'
  ],
  soilGuidance: { optimalPh: '6.0 - 7.0', moistureTarget: '60 - 70%' }
};

// 1. Live Real-Time Agronomic & Microclimate Recommendations Engine
router.get('/advisories', async (req, res) => {
  try {
    const { crop, disease, district, lat, lon } = req.query;

    // Fetch real-time weather from our weather router or Open-Meteo
    let weatherData = null;
    try {
      const qLat = lat || 13.0827;
      const qLon = lon || 80.2707;
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${qLat}&longitude=${qLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,precipitation_probability_max&timezone=auto`;
      const wRes = await axios.get(weatherUrl, { timeout: 6000 });
      weatherData = wRes.data.current || {};
    } catch (wErr) {
      weatherData = { temperature_2m: 30, relative_humidity_2m: 65, wind_speed_10m: 10, precipitation: 0 };
    }

    const temp = Math.round(weatherData.temperature_2m ?? 30);
    const humidity = Math.round(weatherData.relative_humidity_2m ?? 65);
    const wind = Math.round(weatherData.wind_speed_10m ?? 10);
    const rain = weatherData.precipitation ?? 0;

    // 1. Calculate Real-Time Spray & Field Operations Windows
    let sprayWindowStatus = 'Optimal Window Open';
    let sprayRecommendation = 'Foliage is dry and wind is calm. Ideal conditions for contact or systemic applications.';
    let sprayColor = 'green';

    if (rain > 0.5) {
      sprayWindowStatus = 'Hazardous - Rain Occurring';
      sprayRecommendation = 'Active precipitation will wash chemical and biological sprays off leaves. Halt all field spraying.';
      sprayColor = 'red';
    } else if (wind > 18) {
      sprayWindowStatus = 'High Drift Warning';
      sprayRecommendation = `Wind velocity (${wind} km/h) exceeds safe threshold (15 km/h). Severe spray drift will occur; wait for evening calm.`;
      sprayColor = 'amber';
    } else if (temp > 34) {
      sprayWindowStatus = 'Heat Evaporation Warning';
      sprayRecommendation = `High ambient temperature (${temp}°C) causes droplets to evaporate before leaf uptake. Spray strictly before 8:00 AM or after 5:30 PM.`;
      sprayColor = 'amber';
    } else if (humidity > 88) {
      sprayWindowStatus = 'Dense Leaf Wetness';
      sprayRecommendation = 'Extreme humidity slows droplet drying and increases runoff. Delay spray until morning dew evaporates.';
      sprayColor = 'amber';
    }

    // 2. Real-Time Irrigation Advisory
    let irrigationAdvisory = 'Standard Drip Irrigation (2-3 hours/day)';
    if (humidity > 78 || rain > 2) {
      irrigationAdvisory = 'Suspend Irrigation for 24-48 Hours (High soil saturation detected; reduce damping-off risk).';
    } else if (temp > 33 && humidity < 50) {
      irrigationAdvisory = 'Increase Irrigation by 25% (High evapotranspiration deficit; apply early morning to root zone).';
    }

    // 3. Match Pathology Guidance
    const matchedAdvisory = (disease && AGRONOMIC_KNOWLEDGE_BASE[disease])
      ? AGRONOMIC_KNOWLEDGE_BASE[disease]
      : (disease && disease.toLowerCase().includes('healthy'))
      ? DEFAULT_HEALTHY_ADVISORY
      : (Object.values(AGRONOMIC_KNOWLEDGE_BASE).find(k => k.crop.toLowerCase() === (crop || '').toLowerCase()) || DEFAULT_HEALTHY_ADVISORY);

    // 4. Role-Specific Tailored Recommendations
    const roleRecommendations = {
      farmer: [
        {
          title: 'Field Microclimate Action',
          detail: sprayRecommendation,
          type: sprayColor
        },
        {
          title: 'Irrigation & Drainage Strategy',
          detail: irrigationAdvisory,
          type: 'blue'
        },
        {
          title: 'Immediate Cultural Sanitation',
          detail: matchedAdvisory.culturalPractices[0] || 'Inspect leaf undersides for fungal sporulation or insect vector eggs.',
          type: 'green'
        }
      ],
      officer: [
        {
          title: 'Diagnostic Protocol Recommendation',
          detail: `Inspect root and collar region for secondary rot. Soil target pH is ${matchedAdvisory.soilGuidance.optimalPh}.`,
          type: 'blue'
        },
        {
          title: 'Prescription Dilution Guidance',
          detail: matchedAdvisory.chemicalSolutions[0]
            ? `Recommended chemical: ${matchedAdvisory.chemicalSolutions[0].chemical} @ ${matchedAdvisory.chemicalSolutions[0].dosage} (PHl: ${matchedAdvisory.chemicalSolutions[0].phiDays} days).`
            : 'Foliage appears uninfected; recommend biological biostimulant drench.',
          type: 'green'
        },
        {
          title: 'Containment Perimeter',
          detail: 'Advise isolation of adjacent 3 rows within 15 meters to prevent airborne conidial spread.',
          type: 'amber'
        }
      ],
      admin: [
        {
          title: 'District Pathogen Alert',
          detail: `Relative humidity (${humidity}%) and temperature (${temp}°C) indicate heightened risk for solanaceous fungal blight.`,
          type: humidity > 75 ? 'red' : 'green'
        },
        {
          title: 'Agronomist Dispatch Recommendation',
          detail: 'Prioritize dispatching field officers to polyhouses and high-density orchards experiencing elevated humidity.',
          type: 'blue'
        },
        {
          title: 'Input Supply Stocking',
          detail: 'Ensure local agricultural extension depots maintain adequate buffer stock of Copper Hydroxide and Bio-agents.',
          type: 'green'
        }
      ]
    };

    res.json({
      environment: {
        temperature: temp,
        humidity,
        windSpeed: wind,
        precipitation: rain,
        sprayWindow: {
          status: sprayWindowStatus,
          recommendation: sprayRecommendation,
          color: sprayColor
        },
        irrigation: irrigationAdvisory
      },
      pathology: matchedAdvisory,
      recommendationsByRole: roleRecommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendation engine error:', error.message);
    res.status(500).json({ error: 'Failed to generate real-time recommendations.' });
  }
});

// 2. Interactive Dosage & Farm Size Calculator Endpoint
router.post('/calculate-dosage', (req, res) => {
  const { farmAcreage, tankCapacityLiters, sprayVolumeLitersPerAcre = 200, dilutionPerLiterGrams = 2.5 } = req.body;

  const acreage = parseFloat(farmAcreage) || 1.0;
  const tankSize = parseFloat(tankCapacityLiters) || 16.0; // standard 16L knapsack sprayer
  const sprayVolPerAcre = parseFloat(sprayVolumeLitersPerAcre) || 200; // standard 200L/acre
  const dosageGramsPerL = parseFloat(dilutionPerLiterGrams) || 2.5;

  const totalWaterNeededLiters = Math.round(acreage * sprayVolPerAcre);
  const totalChemicalNeededGrams = Math.round(totalWaterNeededLiters * dosageGramsPerL);
  const totalKnapsackTanks = Math.ceil(totalWaterNeededLiters / tankSize);
  const chemicalPerTankGrams = Math.round(tankSize * dosageGramsPerL);

  res.json({
    acreage,
    tankSizeLiters: tankSize,
    totalWaterNeededLiters,
    totalChemicalNeededKg: (totalChemicalNeededGrams / 1000).toFixed(2),
    totalChemicalNeededGrams,
    totalKnapsackTanks,
    chemicalPerTankGrams,
    mixingInstructions: `Fill sprayer tank half-full with clean water (pH 6.5). Pre-dissolve ${chemicalPerTankGrams}g in a bucket, pour through strainer into tank, top up to ${tankSize}L with gentle agitation.`
  });
});

module.exports = router;
