// netlify/functions/health.js - Health check para Netlify
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Lidar com OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "NEO FlowOff Netlify Functions",
      apis: {
        invertexto: process.env.INVERTEXTO_API_TOKEN && process.env.INVERTEXTO_API_TOKEN !== 'seu_token_real_aqui' ? "✅ Configurado" : "⚠️ Token não configurado"
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        netlify: true
      }
    })
  };
};
