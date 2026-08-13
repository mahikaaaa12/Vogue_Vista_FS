// bodyAnalysisService.js
// Production API service connecting Frontend -> Django REST Backend -> Explicit Model Predictions

const API_BASE_URL = 'http://localhost:8000/api/body-analysis';

/**
 * Uploads image to Django backend with explicit gender parameter routing
 * @param {File[]} files - The array of image files to upload
 * @param {string} gender - Explicit gender model route ('male' | 'female')
 * @returns {Promise<{imageGroupRef: string, urls: string[], backendData: object}>}
 */
export async function uploadImages(files, gender = 'female') {
  try {
    const formData = new FormData();
    if (files && files.length > 0) {
      formData.append('image', files[0]);
    }
    formData.append('gender', gender);
    
    const response = await fetch(`${API_BASE_URL}/predict/`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return {
        imageGroupRef: `group_${data.id || Math.random().toString(36).substr(2, 9)}`,
        urls: files.map(file => URL.createObjectURL(file)),
        backendData: data
      };
    } else {
      let errData = {};
      try { errData = await response.json(); } catch (_) {}
      throw new Error(errData.detail || errData.message || `Request failed (${response.status})`);
    }
  } catch (error) {
    console.warn("Backend API notice:", error);
    throw error;
  }
}

export async function analyzeBody(imageGroupRef) {
  return {
    taskId: `task_${Math.random().toString(36).substr(2, 9)}`,
  };
}

export async function getBodyProfile(taskId, backendData = null) {
  if (backendData) {
    let recs = [];
    const rawRecs = backendData.recommendations;
    if (Array.isArray(rawRecs)) {
      recs = rawRecs;
    } else if (rawRecs && typeof rawRecs === 'object') {
      // object form — prefer styling_tips, fallback to collecting all categories
      const keys = ['tops', 'bottoms', 'dresses', 'ethnicwear', 'officewear', 'casualwear', 'footwear', 'accessories', 'styling_tips', 'avoid'];
      if (Array.isArray(rawRecs.styling_tips) && rawRecs.styling_tips.length > 0) {
        recs = rawRecs.styling_tips;
      } else {
        keys.forEach(k => {
          if (Array.isArray(rawRecs[k])) recs.push(...rawRecs[k]);
        });
      }
    }
    return {
      height: 172,
      weight: 62,
      shape: backendData.shape || backendData.body_shape,
      body_shape: backendData.body_shape || backendData.shape,
      confidence: backendData.confidence,
      confidence_pct: backendData.confidence_pct,
      modelLoaded: backendData.model_loaded,
      model_loaded: backendData.model_loaded,
      description: backendData.description || '',
      emoji: backendData.emoji || '',
      traits: backendData.traits || [],
      scores: backendData.scores || {},
      proportions: backendData.proportions || { shoulderWaistRatio: 1.25, waistHipRatio: 0.72 },
      probabilities: backendData.probabilities || {},
      recommendations: recs,
      rawRecommendations: rawRecs || {}
    };
  }

  const shapes = ['Hourglass', 'Pear', 'Rectangle', 'Inverted Triangle', 'Apple'];
  const mockShape = shapes[Math.floor(Math.random() * shapes.length)];
  return {
    height: 172,
    weight: 62,
    shape: mockShape,
    proportions: {
      shoulderWaistRatio: 1.25,
      waistHipRatio: 0.72
    },
    recommendations: [
      "Fitted wrap dresses that define your waistline",
      "V-neck or scoop necklines"
    ]
  };
}

/**
 * Sends body measurements to Django backend for AI-powered body shape analysis and recommendations.
 * @param {object} data - { gender, shoulder, waist, hip, torso, unit }
 * @returns {Promise<object>}
 */
export async function analyzeMeasurements(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/measurements/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return await response.json();
    } else {
      let errData = {};
      try { errData = await response.json(); } catch (_) {}
      throw new Error(errData.detail || errData.message || `Request failed (${response.status})`);
    }
  } catch (error) {
    console.warn("Backend API notice:", error);
    throw error;
  }
}

