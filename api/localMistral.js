// api/localMistral.js
const axios = require("axios");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: "Missing input" });

  // System prompt wrapper
  const system = "Você é o assistente oficial da NEO.FLOWOFF. Fale profissional, objetivo e seguro. Nunca incite danos. Responda em Português (PT-BR).";
  const prompt = `${system}\n\nUsuário: ${input}\n\nResponda brevemente:`;

  try {
    const r = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral-local",
      prompt,
      max_tokens: 200,
      temperature: 0.2
    }, { timeout: 120000 });

    const output = r.data?.response || r.data?.text || JSON.stringify(r.data);
    return res.status(200).json({ output });
  } catch (err) {
    console.error("Erro Ollama proxy:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Erro no Ollama proxy", details: err?.message });
  }
}

module.exports = handler;
