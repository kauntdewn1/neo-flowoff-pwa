// netlify/functions/invertexto.js - Função Netlify para API Invertexto
const axios = require('axios');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Método não permitido',
        message: 'Use POST para este endpoint'
      })
    };
  }

  try {
    const { endpoint, params = {} } = JSON.parse(event.body);
    
    // Validação de entrada
    if (!endpoint) {
      console.log('❌ Endpoint não fornecido');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Endpoint é obrigatório",
          message: "Especifique o endpoint da API Invertexto",
          availableEndpoints: [
            'barcode', 'qrcode', 'geoip', 'currency', 'faker',
            'validator', 'cep', 'cnpj', 'number-to-words', 'email-validator'
          ]
        })
      };
    }

    // Verificar token
    const token = process.env.INVERTEXTO_API_TOKEN;
    if (!token || token === 'seu_token_real_aqui') {
      console.log('❌ Token não configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Token não configurado",
          message: "Configure INVERTEXTO_API_TOKEN nas variáveis de ambiente da Netlify",
          help: "Obtenha seu token em: https://invertexto.com/api"
        })
      };
    }

    // Construir URL da API
    const baseUrl = 'https://invertexto.com/api';
    const url = `${baseUrl}/${endpoint}`;
    
    // Preparar parâmetros
    const requestParams = {
      token,
      ...params
    };

    // Log detalhado
    console.log(`🔗 [${new Date().toISOString()}] Requisição para: ${url}`);
    console.log(`📊 [${new Date().toISOString()}] Parâmetros:`, JSON.stringify(requestParams, null, 2));

    // Fazer requisição com timeout otimizado
    const startTime = Date.now();
    const response = await axios.post(url, requestParams, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NEO.FLOWOFF-PWA/1.0',
        'Accept': 'application/json'
      },
      timeout: 15000, // 15 segundos para Netlify
      validateStatus: (status) => status < 500 // Aceitar 4xx como válidos
    });
    const endTime = Date.now();

    // Log de sucesso
    console.log(`✅ [${new Date().toISOString()}] Resposta recebida em ${endTime - startTime}ms`);
    console.log(`📈 [${new Date().toISOString()}] Status: ${response.status}`);
    console.log(`📄 [${new Date().toISOString()}] Dados:`, JSON.stringify(response.data, null, 2));

    // Resposta otimizada
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify({
        success: response.status < 400,
        data: response.data,
        meta: {
          endpoint,
          status: response.status,
          responseTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString(),
          server: 'Netlify Functions'
        }
      })
    };

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Erro na API Invertexto:`, error.message);
    
    // Análise detalhada do erro
    let errorMessage = "Erro interno do servidor";
    let statusCode = 500;
    let errorDetails = {};

    if (error.response) {
      // Erro da API Invertexto
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || 
                   error.response.data?.error || 
                   `Erro da API Invertexto (${statusCode})`;
      
      errorDetails = {
        apiStatus: error.response.status,
        apiData: error.response.data,
        apiHeaders: error.response.headers
      };
      
      console.error(`📊 [${timestamp}] Detalhes do erro da API:`, errorDetails);
      
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Timeout na requisição";
      statusCode = 408;
      errorDetails = { timeout: '15s' };
      
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Serviço indisponível";
      statusCode = 503;
      errorDetails = { reason: 'DNS resolution failed' };
      
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Conexão recusada";
      statusCode = 503;
      errorDetails = { reason: 'Connection refused' };
    }

    // Log detalhado do erro
    console.error(`🔍 [${timestamp}] Análise completa do erro:`, {
      message: error.message,
      code: error.code,
      statusCode,
      errorDetails
    });

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails,
        meta: {
          endpoint: JSON.parse(event.body)?.endpoint,
          timestamp,
          server: 'Netlify Functions',
          errorCode: error.code
        }
      })
    };
  }
};
