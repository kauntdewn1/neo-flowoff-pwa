// local-server.js - Servidor local para testar proxy Ollama
const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const localMistral = require("./api/localMistral");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Rota para proxy Ollama
app.post("/api/localMistral", localMistral);

// Proxy para API Invertexto
app.post("/api/invertexto", async (req, res) => {
  try {
    const { endpoint, params = {} } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: "Endpoint é obrigatório",
        message: "Especifique o endpoint da API Invertexto"
      });
    }

    const token = process.env.INVERTEXTO_API_TOKEN;
    if (!token || token === 'seu_token_real_aqui') {
      return res.status(500).json({
        success: false,
        error: "Token não configurado",
        message: "Configure INVERTEXTO_API_TOKEN no arquivo .env"
      });
    }

    // Construir URL da API Invertexto
    const baseUrl = 'https://invertexto.com/api';
    const url = `${baseUrl}/${endpoint}`;
    
    // Preparar parâmetros com token
    const requestParams = {
      token,
      ...params
    };

    console.log(`🔗 Fazendo requisição para: ${url}`);
    console.log(`📊 Parâmetros:`, requestParams);

    // Fazer requisição para API Invertexto
    const response = await axios.post(url, requestParams, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NEO.FLOWOFF-PWA/1.0'
      },
      timeout: 10000 // 10 segundos
    });

    console.log(`✅ Resposta recebida:`, response.data);

    res.json({
      success: true,
      data: response.data,
      endpoint,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Erro na API Invertexto:`, error.message);
    
    let errorMessage = "Erro interno do servidor";
    let statusCode = 500;

    if (error.response) {
      // Erro da API Invertexto
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || error.response.data?.error || "Erro da API Invertexto";
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Timeout na requisição";
      statusCode = 408;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Serviço indisponível";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      endpoint: req.body.endpoint,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "NEO FlowOff Local Server",
    apis: {
      localMistral: "✅ Disponível",
      invertexto: process.env.INVERTEXTO_API_TOKEN && process.env.INVERTEXTO_API_TOKEN !== 'seu_token_real_aqui' ? "✅ Configurado" : "⚠️ Token não configurado"
    }
  });
});

// Servir o PWA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor local rodando em http://localhost:${PORT}`);
  console.log(`🤖 Proxy Ollama disponível em http://localhost:${PORT}/api/localMistral`);
  console.log(`📱 PWA disponível em http://localhost:${PORT}`);
  console.log(`\n📋 Para testar o proxy:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/localMistral \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"input":"Explique IA descentralizada de forma simples."}'`);
});
