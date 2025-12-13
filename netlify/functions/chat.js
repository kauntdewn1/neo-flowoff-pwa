// netlify/functions/chat.js - Chat IA com OpenAI/Gemini
const axios = require('axios');

const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

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
    const { message, history = [] } = JSON.parse(event.body);
    
    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Mensagem é obrigatória'
        })
      };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    // Modelos via variáveis de ambiente (configurados no netlify.toml)
    const OPENAI_MODEL = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini';
    const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.LLM_MODEL_FALLBACK || 'gemini-2.0-flash-exp';

    // Sistema de prompt para o agente
    const systemPrompt = `Você é NEO, o assistente IA da FlowOFF. A FlowOFF é uma agência especializada em:
- Marketing digital avançado e estratégia
- Blockchain e Web3
- Desenvolvimento de sistemas, WebApps e PWAs
- Tokenização de ativos
- Agentes IA personalizados
- Arquitetura de ecossistemas digitais

Você deve:
- Responder de forma direta, útil e profissional
- Ser proativo em ajudar, não apenas direcionar para humanos
- Usar conhecimento real sobre os serviços da FlowOFF
- Manter tom conversacional mas técnico quando necessário
- Se não souber algo específico, seja honesto mas ofereça alternativas

NÃO direcione imediatamente para humanos. Tente resolver primeiro com sua inteligência.`;

    let aiResponse = null;
    let modelUsed = null;
    let errorDetails = null;

    // Verificar se há chaves de API configuradas
    if (!OPENAI_API_KEY && !GOOGLE_API_KEY) {
      log('⚠️ Nenhuma API key configurada');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'API keys não configuradas',
          message: 'Configure OPENAI_API_KEY ou GOOGLE_API_KEY no Netlify'
        })
      };
    }

    // Tentar OpenAI primeiro
    if (OPENAI_API_KEY) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10), // Últimas 10 mensagens para contexto
          { role: 'user', content: message }
        ];

        const openaiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: OPENAI_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        aiResponse = openaiResponse.data.choices[0]?.message?.content?.trim();
        modelUsed = OPENAI_MODEL;
        log('✅ OpenAI response received:', aiResponse?.substring(0, 50) + '...');
      } catch (error) {
        errorDetails = error.response?.data || error.message;
        log('❌ OpenAI error:', error.message);
        if (error.response?.status === 401) {
          log('⚠️ OpenAI API key inválida ou expirada');
        }
      }
    }

    // Fallback para Gemini se OpenAI falhar
    if (!aiResponse && GOOGLE_API_KEY) {
      try {
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nHistórico:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUsuário: ${message}\n\nNEO:`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          },
          {
            timeout: 15000
          }
        );

        aiResponse = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        modelUsed = GEMINI_MODEL.replace('-exp', '');
        log('✅ Gemini response received:', aiResponse?.substring(0, 50) + '...');
      } catch (error) {
        errorDetails = error.response?.data || error.message;
        log('❌ Gemini error:', error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
          log('⚠️ Google API key inválida ou expirada');
        }
      }
    }

    // Se nenhuma API funcionou, retornar erro claro
    if (!aiResponse) {
      log('❌ Nenhuma API de IA funcionou');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'APIs de IA indisponíveis',
          message: 'Todas as tentativas de API falharam. Verifique as chaves de API.',
          details: process.env.NETLIFY_DEV ? errorDetails : undefined
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: aiResponse,
        model: modelUsed,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    log('❌ Chat API error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
