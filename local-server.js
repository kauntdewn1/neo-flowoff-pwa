// local-server.js - Servidor local para testar proxy Ollama
const express = require("express");
const cors = require("cors");
const path = require("path");
const localMistral = require("./api/localMistral");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Rota para proxy Ollama
app.post("/api/localMistral", localMistral);

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "NEO FlowOff Local Server"
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
