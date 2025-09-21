// api/localMistral.js
const axios = require("axios");

// Configurações otimizadas
const CONFIG = {
  model: "mistral-local",
  max_tokens: 150,
  temperature: 0.2, // 0.0-0.3 para respostas seguras
  top_p: 0.9,
  timeout: 120000
};

// Palavras banidas e padrões de segurança
const BANNED_WORDS = [
  "violência", "violencia", "hack", "hacking", "crack", "cracking",
  "exploit", "malware", "vírus", "virus", "ataque", "bomba",
  "suicídio", "suicidio", "morte", "matar", "assassinato",
  "drogas", "drogas ilícitas", "tráfico", "trafico"
];

// Heurísticas de segurança
const SAFETY_PATTERNS = [
  /como (fazer|criar|construir).*(bomba|explosivo|arma)/i,
  /como (hackear|crackear|invadir)/i,
  /tutorial.*(violência|violencia)/i,
  /instruções.*(perigoso|perigosa)/i
];

// Função para detectar conteúdo inadequado
function detectInappropriateContent(text) {
  const lowerText = text.toLowerCase();
  
  // Verificar palavras banidas
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      return { detected: true, reason: `Palavra banida: ${word}` };
    }
  }
  
  // Verificar padrões de segurança
  for (const pattern of SAFETY_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, reason: "Padrão de segurança detectado" };
    }
  }
  
  return { detected: false };
}

// Função para classificar segurança da resposta
function classifyResponseSafety(response) {
  const safety = {
    score: 0,
    flags: [],
    safe: true
  };
  
  const lowerResponse = response.toLowerCase();
  
  // Verificar indicadores de segurança
  if (lowerResponse.includes("não posso") || lowerResponse.includes("não posso ajudar")) {
    safety.score += 10; // Bom sinal
  }
  
  if (lowerResponse.includes("inapropriado") || lowerResponse.includes("inadequado")) {
    safety.score += 5;
  }
  
  // Verificar indicadores de risco
  if (lowerResponse.includes("como fazer") && lowerResponse.includes("perigoso")) {
    safety.score -= 20;
    safety.flags.push("instruções perigosas");
  }
  
  if (lowerResponse.includes("fácil") && lowerResponse.includes("ilegal")) {
    safety.score -= 15;
    safety.flags.push("facilitação de atividades ilegais");
  }
  
  // Determinar se é seguro
  safety.safe = safety.score >= 0 && safety.flags.length === 0;
  
  return safety;
}

// Função para gerar resposta de segurança
function generateSafetyResponse() {
  const responses = [
    "Desculpe, não posso ajudar com esse tipo de solicitação. Posso auxiliar com questões sobre marketing digital, tecnologia blockchain ou desenvolvimento de sistemas?",
    "Essa pergunta está fora do escopo dos meus serviços. Posso ajudar com consultoria em marketing, desenvolvimento web ou soluções tecnológicas?",
    "Não posso fornecer informações sobre esse tópico. Como posso ajudar com estratégias de marketing ou desenvolvimento de projetos digitais?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: "Missing input" });

  // Verificar entrada antes de processar
  const inputCheck = detectInappropriateContent(input);
  if (inputCheck.detected) {
    console.warn(`Conteúdo inadequado detectado: ${inputCheck.reason}`);
    return res.status(200).json({ 
      output: generateSafetyResponse(),
      safety: { blocked: true, reason: inputCheck.reason }
    });
  }

  // System prompt otimizado com guardrails
  const system = `Você é o assistente oficial da NEO.FLOWOFF, especialista em marketing digital, blockchain e desenvolvimento de sistemas. 

DIRETRIZES DE SEGURANÇA:
- Responda APENAS sobre marketing, tecnologia, blockchain e desenvolvimento
- Se a pergunta for sobre violência, hacking, drogas ou atividades ilegais, responda: "Não posso ajudar com esse tipo de solicitação. Posso auxiliar com questões sobre marketing digital, tecnologia blockchain ou desenvolvimento de sistemas?"
- Seja profissional, objetivo e seguro
- Responda em Português (PT-BR)
- Mantenha respostas concisas (máximo 150 tokens)

Sua resposta:`;

  const prompt = `${system}\n\nUsuário: ${input}\n\nAssistente:`;

  try {
    const r = await axios.post("http://localhost:11434/api/generate", {
      model: CONFIG.model,
      prompt,
      max_tokens: CONFIG.max_tokens,
      temperature: CONFIG.temperature,
      top_p: CONFIG.top_p
    }, { timeout: CONFIG.timeout });

    // Processar resposta do Ollama (pode vir como stream ou objeto)
    let rawOutput = '';
    
    if (typeof r.data === 'string') {
      // Se for string, extrair apenas a resposta final do stream
      const lines = r.data.split('\n').filter(line => line.trim());
      let finalResponse = '';
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.done === true && parsed.response) {
            finalResponse = parsed.response;
            break;
          } else if (parsed.response) {
            finalResponse += parsed.response;
          }
        } catch (e) {
          // Ignorar linhas que não são JSON válido
          continue;
        }
      }
      
      rawOutput = finalResponse || r.data;
    } else if (r.data?.response) {
      rawOutput = r.data.response;
    } else if (r.data?.text) {
      rawOutput = r.data.text;
    } else {
      rawOutput = JSON.stringify(r.data);
    }
    
    // Classificar segurança da resposta
    const safety = classifyResponseSafety(rawOutput);
    
    // Se não for seguro, retornar resposta de segurança
    if (!safety.safe) {
      console.warn(`Resposta bloqueada por segurança: ${safety.flags.join(", ")}`);
      return res.status(200).json({ 
        output: generateSafetyResponse(),
        safety: { blocked: true, flags: safety.flags }
      });
    }
    
    // Verificar conteúdo inadequado na resposta
    const outputCheck = detectInappropriateContent(rawOutput);
    if (outputCheck.detected) {
      console.warn(`Conteúdo inadequado na resposta: ${outputCheck.reason}`);
      return res.status(200).json({ 
        output: generateSafetyResponse(),
        safety: { blocked: true, reason: outputCheck.reason }
      });
    }
    
    return res.status(200).json({ 
      output: rawOutput,
      safety: { safe: true, score: safety.score }
    });
    
  } catch (err) {
    console.error("Erro Ollama proxy:", err?.response?.data || err.message);
    return res.status(500).json({ 
      error: "Erro no Ollama proxy", 
      details: err?.message 
    });
  }
}

module.exports = handler;
