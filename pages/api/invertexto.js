// pages/api/invertexto.js - Endpoint Next.js otimizado para API Invertexto
import axios from 'axios';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Lidar com OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido',
      message: 'Use POST para este endpoint'
    });
  }

  try {
    const { endpoint, params = {} } = req.body;
    
    // Validação de entrada
    if (!endpoint) {
      console.log('❌ Endpoint não fornecido');
      return res.status(400).json({
        success: false,
        error: "Endpoint é obrigatório",
        message: "Especifique o endpoint da API Invertexto",
        availableEndpoints: [
          'barcode', 'qrcode', 'geoip', 'currency', 'faker',
          'validator', 'cep', 'cnpj', 'number-to-words', 'email-validator'
        ]
      });
    }

    // Verificar token
    const token = process.env.INVERTEXTO_API_TOKEN;
    if (!token || token === 'seu_token_real_aqui') {
      console.log('❌ Token não configurado');
      return res.status(500).json({
        success: false,
        error: "Token não configurado",
        message: "Configure INVERTEXTO_API_TOKEN nas variáveis de ambiente",
        help: "Obtenha seu token em: https://invertexto.com/api"
      });
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
      timeout: 15000, // 15 segundos para Next.js
      validateStatus: (status) => status < 500 // Aceitar 4xx como válidos
    });
    const endTime = Date.now();

    // Log de sucesso
    console.log(`✅ [${new Date().toISOString()}] Resposta recebida em ${endTime - startTime}ms`);
    console.log(`📈 [${new Date().toISOString()}] Status: ${response.status}`);
    console.log(`📄 [${new Date().toISOString()}] Dados:`, JSON.stringify(response.data, null, 2));

    // Resposta otimizada
    res.status(response.status).json({
      success: response.status < 400,
      data: response.data,
      meta: {
        endpoint,
        status: response.status,
        responseTime: `${endTime - startTime}ms`,
        timestamp: new Date().toISOString(),
        server: 'Next.js API Route'
      }
    });

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

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      meta: {
        endpoint: req.body?.endpoint,
        timestamp,
        server: 'Next.js API Route',
        errorCode: error.code
      }
    });
  }
}

// Configuração para Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '5mb',
  },
}
