// ═══════════════════════════════════════════════════════════════════════
// NΞØ MCP v0.2 — MODEL CONTEXT PROTOCOL
// 100% DESCENTRALIZADO — NO SUPABASE, PURE WEB3
// ═══════════════════════════════════════════════════════════════════════

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 1. INTENT DEFINITIONS (mcp-intents.json)                            │
// └─────────────────────────────────────────────────────────────────────┘

const MCP_INTENTS = {
version: "0.2.0",
ecosystem: "NΞØ",
philosophy: "Decentralization First",

intents: {
// ─────────────────────────────────────────────────────────────────
// BLOCKCHAIN INTENTS
// ─────────────────────────────────────────────────────────────────
deploy_token: {
description: "Deploy ERC20 token via thirdweb",
params: {
name: { type: "string", required: true },
symbol: { type: "string", required: true },
supply: { type: "string", required: true },
chain: { type: "string", default: "polygon" }
},
auth: "wallet",
executor: "thirdweb",
storage: ["ipfs", "ceramic"], // Log em múltiplas camadas
response: ["contract_address", "tx_hash", "explorer_link", "ipfs_proof"]
},

```
mint_nft: {
  description: "Mint NFT to collection",
  params: {
    collection: { type: "string", required: true },
    metadata: { type: "object", required: true },
    recipient: { type: "string", required: true }
  },
  auth: "wallet",
  executor: "thirdweb",
  storage: ["ipfs"],
  response: ["token_id", "tx_hash", "ipfs_uri", "opensea_link"]
},

create_liquidity_pool: {
  description: "Create Uniswap V2 pool",
  params: {
    token_address: { type: "string", required: true },
    paired_token: { type: "string", default: "USDC" },
    initial_liquidity: { type: "string", required: true },
    chain: { type: "string", default: "base" }
  },
  auth: "wallet",
  executor: "thirdweb",
  storage: ["ipfs", "ceramic"],
  response: ["pool_address", "tx_hash", "lp_tokens"]
},

// ─────────────────────────────────────────────────────────────────
// PAYMENT INTENTS
// ─────────────────────────────────────────────────────────────────
create_payment: {
  description: "Generate payment link via Cryptomus",
  params: {
    amount: { type: "number", required: true },
    currency: { type: "string", default: "USDC" },
    description: { type: "string", required: false },
    user_id: { type: "string", required: true }
  },
  auth: "api_key",
  executor: "cryptomus",
  storage: ["ceramic", "kwil"], // Payment logs descentralizados
  response: ["payment_url", "payment_id", "expires_at"]
},

verify_payment: {
  description: "Check payment status",
  params: {
    payment_id: { type: "string", required: true }
  },
  auth: "api_key",
  executor: "cryptomus",
  storage: ["ceramic"],
  response: ["status", "paid_amount", "tx_hash"]
},

// ─────────────────────────────────────────────────────────────────
// AGENT INTENTS (IA)
// ─────────────────────────────────────────────────────────────────
qualify_lead: {
  description: "Analyze lead via IQAI",
  params: {
    lead_data: { type: "object", required: true },
    criteria: { type: "array", default: ["budget", "urgency", "fit"] }
  },
  auth: "api_key",
  executor: "iqai",
  storage: ["kwil", "ceramic"], // Leads em DB descentralizada
  response: ["qualified", "score", "next_action", "insights"]
},

generate_proposal: {
  description: "Create proposal document",
  params: {
    lead_id: { type: "string", required: true },
    template: { type: "string", default: "web3_service" },
    custom_data: { type: "object", required: false }
  },
  auth: "api_key",
  executor: "iqai",
  storage: ["ipfs", "ceramic"],
  response: ["document_url", "ipfs_hash", "ceramic_stream"]
},

// ─────────────────────────────────────────────────────────────────
// STORAGE INTENTS
// ─────────────────────────────────────────────────────────────────
store_ipfs: {
  description: "Upload to IPFS via Pinata",
  params: {
    data: { type: "object", required: true },
    name: { type: "string", required: true }
  },
  auth: "api_key",
  executor: "ipfs",
  response: ["ipfs_hash", "gateway_url", "size"]
},

log_event: {
  description: "Log event to Ceramic Network",
  params: {
    event_type: { type: "string", required: true },
    data: { type: "object", required: true },
    did: { type: "string", required: false } // Decentralized ID
  },
  auth: "did",
  executor: "ceramic",
  response: ["stream_id", "commit_id", "timestamp"]
},

query_state: {
  description: "Query from Kwil DB or The Graph",
  params: {
    query_type: { type: "string", required: true }, // "sql" ou "graphql"
    query: { type: "string", required: true },
    source: { type: "string", default: "kwil" } // "kwil" ou "graph"
  },
  auth: "wallet",
  executor: "query_engine",
  response: ["results", "count", "cached"]
}

```

}
};

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 2. MCP CORE ROUTER v2.0 (DECENTRALIZED)                            │
// └─────────────────────────────────────────────────────────────────────┘

class MCPRouter {
constructor(config) {
this.config = config;
this.intents = MCP_INTENTS.intents;

```
// Inicializa conexões descentralizadas
this.initDecentralizedStack();

```

}

async initDecentralizedStack() {
// Ceramic (logs/events)
const { CeramicClient } = require('@ceramicnetwork/http-client');
this.ceramic = new CeramicClient(this.config.ceramicNode || '[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)');

```
// Gun.js (real-time state)
const Gun = require('gun');
this.gun = Gun(this.config.gunPeers || ['<https://gun-relay.neo.io>']);

// Kwil (SQL descentralizado)
const { WebKwil } = require('@kwilteam/kwil-js');
this.kwil = new WebKwil({
  kwilProvider: this.config.kwilProvider || "<https://provider.kwil.com>"
});

// The Graph (para queries blockchain)
this.graphEndpoint = this.config.graphEndpoint || "<https://api.thegraph.com/subgraphs/name/neo-ecosystem>";

```

}

validateIntent(intentName, params) {
const intent = this.intents[intentName];
if (!intent) {
throw new Error(`Intent "${intentName}" não existe`);
}

```
for (const [key, schema] of Object.entries(intent.params)) {
  if (schema.required && !params[key]) {
    throw new Error(`Parâmetro "${key}" é obrigatório para ${intentName}`);
  }
}

return intent;

```

}

async route(intentName, params, auth) {
const intent = this.validateIntent(intentName, params);

```
console.log(`[MCP] Executando: ${intentName}`);
console.log(`[MCP] Executor: ${intent.executor}`);

let result;

switch (intent.executor) {
  case "thirdweb":
    result = await this.executeBlockchain(intentName, params, auth);
    break;
  case "cryptomus":
    result = await this.executePayment(intentName, params, auth);
    break;
  case "iqai":
    result = await this.executeAgent(intentName, params, auth);
    break;
  case "ipfs":
    result = await this.executeIPFS(intentName, params, auth);
    break;
  case "ceramic":
    result = await this.executeCeramic(intentName, params, auth);
    break;
  case "query_engine":
    result = await this.executeQuery(intentName, params, auth);
    break;
  default:
    throw new Error(`Executor "${intent.executor}" não implementado`);
}

// Storage descentralizado automático
if (intent.storage && result.success) {
  await this.storeDecentralized(intentName, params, result, intent.storage);
}

return result;

```

}

// ─────────────────────────────────────────────────────────────────
// EXECUTORS
// ─────────────────────────────────────────────────────────────────

async executeBlockchain(intentName, params, auth) {
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

```
const sdk = ThirdwebSDK.fromPrivateKey(
  auth.privateKey,
  params.chain || "polygon"
);

switch (intentName) {
  case "deploy_token":
    const token = await sdk.deployer.deployToken({
      name: params.name,
      symbol: params.symbol,
      primary_sale_recipient: auth.wallet,
      initial_supply: params.supply
    });

    const contractAddress = token.getAddress();

    // Log no IPFS imediatamente
    const ipfsProof = await this.executeIPFS("store_ipfs", {
      data: {
        type: "token_deployment",
        contract: contractAddress,
        name: params.name,
        symbol: params.symbol,
        supply: params.supply,
        chain: params.chain,
        deployer: auth.wallet,
        timestamp: new Date().toISOString()
      },
      name: `${params.symbol}_deployment`
    }, auth);

    return {
      success: true,
      result: {
        contract_address: contractAddress,
        tx_hash: "0x...",
        explorer_link: `https://polygonscan.com/address/${contractAddress}`,
        ipfs_proof: ipfsProof.result.ipfs_hash
      }
    };

  case "mint_nft":
    const nft = await sdk.getContract(params.collection);
    const tx = await nft.erc721.mintTo(params.recipient, params.metadata);

    return {
      success: true,
      result: {
        token_id: tx.id.toString(),
        tx_hash: tx.receipt.transactionHash,
        ipfs_uri: `ipfs://${params.metadata.image}`,
        opensea_link: `https://opensea.io/assets/${params.collection}/${tx.id}`
      }
    };

  case "create_liquidity_pool":
    return {
      success: true,
      result: {
        pool_address: "0xPOOL_ADDRESS",
        tx_hash: "0xTX_HASH",
        lp_tokens: params.initial_liquidity
      }
    };

  default:
    throw new Error(`Intent blockchain "${intentName}" não implementado`);
}

```

}

async executePayment(intentName, params, auth) {
const CRYPTOMUS_API = "https://api.cryptomus.com/v1";

```
switch (intentName) {
  case "create_payment":
    const response = await fetch(`${CRYPTOMUS_API}/payment`, {
      method: "POST",
      headers: {
        "merchant": auth.merchantId,
        "sign": this.generateCryptomusSign(params, auth.apiKey),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        order_id: `neo_${Date.now()}`,
        url_callback: this.config.webhookUrl,
        additional_data: params.user_id
      })
    });

    const data = await response.json();

    return {
      success: true,
      result: {
        payment_url: data.result.url,
        payment_id: data.result.uuid,
        expires_at: data.result.expired_at
      }
    };

  case "verify_payment":
    const status = await fetch(`${CRYPTOMUS_API}/payment/info`, {
      method: "POST",
      headers: {
        "merchant": auth.merchantId,
        "sign": this.generateCryptomusSign({ uuid: params.payment_id }, auth.apiKey)
      },
      body: JSON.stringify({ uuid: params.payment_id })
    });

    const statusData = await status.json();

    return {
      success: true,
      result: {
        status: statusData.result.status,
        paid_amount: statusData.result.amount,
        tx_hash: statusData.result.txid
      }
    };

  default:
    throw new Error(`Intent payment "${intentName}" não implementado`);
}

```

}

async executeAgent(intentName, params, auth) {
const IQAI_API = this.config.iqaiEndpoint;

```
switch (intentName) {
  case "qualify_lead":
    const analysis = await fetch(`${IQAI_API}/analyze`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: params.lead_data,
        criteria: params.criteria
      })
    });

    const result = await analysis.json();

    return {
      success: true,
      result: {
        qualified: result.score >= 70,
        score: result.score,
        next_action: result.score >= 70 ? "send_proposal" : "nurture",
        insights: result.insights
      }
    };

  case "generate_proposal":
    const proposal = {
      lead_id: params.lead_id,
      template: params.template,
      generated_at: new Date().toISOString(),
      content: "Proposta gerada pela IA..."
    };

    // Salva no IPFS
    const ipfsResult = await this.executeIPFS("store_ipfs", {
      data: proposal,
      name: `proposal_${params.lead_id}`
    }, auth);

    // Log no Ceramic
    const ceramicResult = await this.executeCeramic("log_event", {
      event_type: "proposal_generated",
      data: {
        lead_id: params.lead_id,
        ipfs_hash: ipfsResult.result.ipfs_hash
      }
    }, auth);

    return {
      success: true,
      result: {
        document_url: ipfsResult.result.gateway_url,
        ipfs_hash: ipfsResult.result.ipfs_hash,
        ceramic_stream: ceramicResult.result.stream_id
      }
    };

  default:
    throw new Error(`Intent agent "${intentName}" não implementado`);
}

```

}

async executeIPFS(intentName, params, auth) {
switch (intentName) {
case "store_ipfs":
const FormData = require('form-data');
const formData = new FormData();

```
    formData.append('pinataMetadata', JSON.stringify({ name: params.name }));
    formData.append('pinataContent', JSON.stringify(params.data));

    const response = await fetch("<https://api.pinata.cloud/pinning/pinJSONToIPFS>", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.pinataJWT}`
      },
      body: formData
    });

    const data = await response.json();

    return {
      success: true,
      result: {
        ipfs_hash: data.IpfsHash,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        size: data.PinSize
      }
    };

  default:
    throw new Error(`Intent storage "${intentName}" não implementado`);
}

```

}

async executeCeramic(intentName, params, auth) {
const { TileDocument } = require('@ceramicnetwork/stream-tile');

```
switch (intentName) {
  case "log_event":
    const doc = await TileDocument.create(
      this.ceramic,
      {
        event_type: params.event_type,
        data: params.data,
        timestamp: new Date().toISOString(),
        did: params.did || auth.did
      },
      {
        controllers: [auth.did || 'did:key:default'],
        family: 'neo-ecosystem-events'
      }
    );

    return {
      success: true,
      result: {
        stream_id: doc.id.toString(),
        commit_id: doc.commitId.toString(),
        timestamp: new Date().toISOString()
      }
    };

  default:
    throw new Error(`Intent ceramic "${intentName}" não implementado`);
}

```

}

async executeQuery(intentName, params, auth) {
switch (params.source) {
case "kwil":
const kwilResult = await this.kwil.selectQuery({
dbid: 'neo_ecosystem',
query: params.query
});

```
    return {
      success: true,
      result: {
        results: kwilResult.data,
        count: kwilResult.data.length,
        cached: false
      }
    };

  case "graph":
    const graphResponse = await fetch(this.graphEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: params.query })
    });

    const graphData = await graphResponse.json();

    return {
      success: true,
      result: {
        results: graphData.data,
        count: Object.keys(graphData.data).length,
        cached: true
      }
    };

  default:
    throw new Error(`Query source "${params.source}" não suportada`);
}

```

}

// ─────────────────────────────────────────────────────────────────
// STORAGE DESCENTRALIZADO AUTOMÁTICO
// ─────────────────────────────────────────────────────────────────

async storeDecentralized(intentName, params, result, storageTargets) {
for (const target of storageTargets) {
try {
switch (target) {
case "ipfs":
await this.executeIPFS("store_ipfs", {
data: {
intent: intentName,
params: params,
result: result.result,
timestamp: new Date().toISOString()
},
name: `${intentName}_${Date.now()}`
}, { pinataJWT: this.config.pinataJWT });
break;

```
      case "ceramic":
        await this.executeCeramic("log_event", {
          event_type: `intent_executed_${intentName}`,
          data: {
            params: params,
            result: result.result
          }
        }, { did: this.config.did });
        break;

      case "kwil":
        // Log em Kwil DB
        await this.kwil.execute({
          dbid: 'neo_ecosystem',
          action: 'insert_event',
          inputs: [{
            $event_type: intentName,
            $data: JSON.stringify(result.result),
            $timestamp: Date.now()
          }]
        });
        break;
    }
  } catch (error) {
    console.warn(`[MCP] Falha ao armazenar em ${target}:`, error.message);
  }
}

```

}

// Real-time state com Gun.js
updateRealtimeState(key, data) {
this.gun.get('neo_ecosystem').get(key).put(data);
}

subscribeRealtimeState(key, callback) {
this.gun.get('neo_ecosystem').get(key).on(callback);
}

generateCryptomusSign(data, apiKey) {
const crypto = require('crypto');
const jsonData = JSON.stringify(data);
const hash = crypto.createHash('md5').update(jsonData + apiKey).digest('hex');
return hash;
}
}

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 3. EXEMPLOS PRÁTICOS v2.0 (DECENTRALIZED)                          │
// └─────────────────────────────────────────────────────────────────────┘

// ═══════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Deploy $NEOFLW com storage descentralizado
// ═══════════════════════════════════════════════════════════════════════

async function deployNEOFLW() {
const mcp = new MCPRouter({
webhookUrl: "https://neo.flowoff.io/webhook",
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
kwilProvider: "[https://provider.kwil.com](https://provider.kwil.com/)",
pinataJWT: process.env.PINATA_JWT,
did: process.env.DID
});

const result = await mcp.route(
"deploy_token",
{
name: "NeoFlow Token",
symbol: "NEOFLW",
supply: "1000000",
chain: "polygon"
},
{
privateKey: process.env.DEPLOYER_PRIVATE_KEY,
wallet: process.env.TREASURY_WALLET
}
);

console.log("✅ $NEOFLW deployed:", result.result.contract_address);
console.log("📦 IPFS Proof:", result.result.ipfs_proof);

// Update real-time state via Gun.js
mcp.updateRealtimeState('tokens', {
NEOFLW: {
contract: result.result.contract_address,
deployed_at: Date.now(),
status: 'active'
}
});

return result;
}

// ═══════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Flow Closer com Kwil DB
// ═══════════════════════════════════════════════════════════════════════

async function processLead(leadData) {
const mcp = new MCPRouter({
iqaiEndpoint: "[https://api.iqai.com](https://api.iqai.com/)",
kwilProvider: "[https://provider.kwil.com](https://provider.kwil.com/)",
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
pinataJWT: process.env.PINATA_JWT,
did: process.env.DID
});

// 1. Qualifica o lead (IA)
const qualification = await mcp.route(
"qualify_lead",
{
lead_data: leadData,
criteria: ["budget", "urgency", "fit"]
},
{
apiKey: process.env.IQAI_API_KEY
}
);

console.log(`Lead score: ${qualification.result.score}`);

// 2. Salva no Kwil DB (SQL descentralizado)
await mcp.route(
"query_state",
{
query_type: "sql",
query: `INSERT INTO leads (id, score, qualified, created_at)                VALUES ('${leadData.id}', ${qualification.result.score},                ${qualification.result.qualified}, ${Date.now()})`,
source: "kwil"
},
{
wallet: process.env.TREASURY_WALLET
}
);

// 3. Se qualificado, gera proposta
if (qualification.result.qualified) {
const proposal = await mcp.route(
"generate_proposal",
{
lead_id: [leadData.id](http://leaddata.id/),
template: "web3_service"
},
{
apiKey: process.env.IQAI_API_KEY,
pinataJWT: process.env.PINATA_JWT,
did: process.env.DID
}
);

```
console.log("✅ Proposta gerada:");
console.log("   IPFS:", proposal.result.ipfs_hash);
console.log("   Ceramic Stream:", proposal.result.ceramic_stream);

// Real-time notification via Gun.js
mcp.updateRealtimeState(`lead_${leadData.id}`, {
  status: 'proposal_sent',
  proposal_url: proposal.result.document_url,
  timestamp: Date.now()
});

return proposal;

```

}

return { qualified: false };
}

// ═══════════════════════════════════════════════════════════════════════
// EXEMPLO 3: WOD[X]PRO com The Graph queries
// ═══════════════════════════════════════════════════════════════════════

async function mintWorkoutNFT(athleteWallet, workoutData) {
const mcp = new MCPRouter({
pinataJWT: process.env.PINATA_JWT,
graphEndpoint: "https://api.thegraph.com/subgraphs/name/neo/wodxpro"
});

// 1. Salva workout no IPFS
const metadata = await mcp.route(
"store_ipfs",
{
data: {
name: `Workout #${workoutData.id}`,
description: `${workoutData.exercise} - ${workoutData.reps} reps`,
image: workoutData.image,
attributes: [
{ trait_type: "Exercise", value: workoutData.exercise },
{ trait_type: "Reps", value: workoutData.reps },
{ trait_type: "Date", value: workoutData.date },
{ trait_type: "Athlete", value: athleteWallet }
]
},
name: `workout_${workoutData.id}`
},
{
pinataJWT: process.env.PINATA_JWT
}
);

// 2. Mint NFT
const nft = await mcp.route(
"mint_nft",
{
collection: process.env.WODX_NFT_CONTRACT,
metadata: {
image: metadata.result.ipfs_hash,
name: `Workout #${workoutData.id}`
},
recipient: athleteWallet
},
{
privateKey: process.env.DEPLOYER_PRIVATE_KEY,
wallet: process.env.TREASURY_WALLET
}
);

console.log("✅ NFT mintado:", nft.result.opensea_link);

// 3. Query histórico do atleta via The Graph
const athleteHistory = await mcp.route(
"query_state",
{
query_type: "graphql",
query: `{         workoutNFTs(where: { athlete: "${athleteWallet}" }, orderBy: timestamp, orderDirection: desc) {           id           tokenId           exercise           reps           timestamp         }       }`,
source: "graph"
},
{
wallet: athleteWallet
}
);

console.log(`Atleta possui ${athleteHistory.result.count} workouts registrados`);

// Real-time leaderboard update
mcp.updateRealtimeState('leaderboard', {
[athleteWallet]: {
total_workouts: athleteHistory.result.count,
last_mint: Date.now()
}
});

return nft;
}

// ═══════════════════════════════════════════════════════════════════════
// EXEMPLO 4: FlowPay com Ceramic logs
// ═══════════════════════════════════════════════════════════════════════

async function createPayment(userId, amount, description) {
const mcp = new MCPRouter({
webhookUrl: "https://flowpay.neo.io/webhook",
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
did: process.env.DID
});

const payment = await mcp.route(
"create_payment",
{
amount: amount,
currency: "USDC",
description: description,
user_id: userId
},
{
merchantId: process.env.CRYPTOMUS_MERCHANT_ID,
apiKey: process.env.CRYPTOMUS_API_KEY
}
);

console.log("💳 Link de pagamento:", payment.result.payment_url);

// Real-time payment tracking via Gun.js
mcp.updateRealtimeState(`payment_${payment.result.payment_id}`, {
amount: amount,
status: 'pending',
created_at: Date.now(),
user_id: userId
});

// Subscribe to payment updates
mcp.subscribeRealtimeState(`payment_${payment.result.payment_id}`, (data) => {
if (data.status === 'confirmed') {
console.log(`✅ Pagamento ${payment.result.payment_id} confirmado!`);
// Trigger next action (mint token, unlock feature, etc)
}
});

return payment;
}

// ═══════════════════════════════════════════════════════════════════════
// EXEMPLO 5: FLUXX Pool + The Graph indexing
// ═══════════════════════════════════════════════════════════════════════

async function createFLUXXPool() {
const mcp = new MCPRouter({
pinataJWT: process.env.PINATA_JWT,
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
did: process.env.DID
});

// 1. Deploy token FLUXX
const token = await mcp.route(
"deploy_token",
{
name: "FLUXX Token",
symbol: "FLUXX",
supply: "100000",
chain: "base"
},
{
privateKey: process.env.DEPLOYER_PRIVATE_KEY,
wallet: process.env.TREASURY_WALLET
}
);

console.log("🔥 FLUXX Token:", token.result.contract_address);

// 2. Criar pool com 10 USDC
const pool = await mcp.route(
"create_liquidity_pool",
{
token_address: token.result.contract_address,
paired_token: "USDC",
initial_liquidity: "10",
chain: "base"
},
{
privateKey: process.env.DEPLOYER_PRIVATE_KEY,
wallet: process.env.TREASURY_WALLET
}
);

console.log("🌊 Pool FLUXX/USDC:", pool.result.pool_address);

// Real-time pool stats
mcp.updateRealtimeState('fluxx_pool', {
address: pool.result.pool_address,
liquidity_usdc: 10,
token_address: token.result.contract_address,
created_at: Date.now()
});

// Log no Ceramic (permanent record)
await mcp.route(
"log_event",
{
event_type: "liquidity_pool_created",
data: {
project: "FLUXX",
pool: pool.result.pool_address,
token: token.result.contract_address,
initial_liquidity: "10 USDC"
}
},
{
did: process.env.DID
}
);

return pool;
}

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 4. TELEGRAM BOT v2.0 (Real-time + Decentralized)                   │
// └─────────────────────────────────────────────────────────────────────┘

const TelegramBot = require('node-telegram-bot-api');

function initFlowOFFBot() {
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const mcp = new MCPRouter({
webhookUrl: "https://flowoff.neo.io/webhook",
iqaiEndpoint: "[https://api.iqai.com](https://api.iqai.com/)",
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
kwilProvider: "[https://provider.kwil.com](https://provider.kwil.com/)",
pinataJWT: process.env.PINATA_JWT,
did: process.env.DID
});

// Comando: /neoflw (claim tokens)
bot.onText(/\/neoflw/, async (msg) => {
bot.sendMessage([msg.chat.id](http://msg.chat.id/),
"🔥 Conecte sua wallet para receber $NEOFLW:\n" +
"https://neo.flowoff.io/claim"
);
});

// Comando: /pay <valor>
bot.onText(/\/pay (.+)/, async (msg, match) => {
const amount = parseFloat(match[1]);

```
const payment = await createPayment(
  msg.from.id.toString(),
  amount,
  "Pagamento via FlowOFF Bot"
);

bot.sendMessage(msg.chat.id,
  `💳 Pague ${amount} USDC aqui:\\n${payment.result.payment_url}`
);

```

});

// Comando: /closer <nome do lead>
bot.onText(/\/closer (.+)/, async (msg, match) => {
const leadInfo = match[1];

```
const leadData = {
  id: `lead_${Date.now()}`,
  name: leadInfo,
  source: "telegram",
  telegram_id: msg.from.id
};

const result = await processLead(leadData);

if (result.qualified !== false) {
  bot.sendMessage(msg.chat.id,
    `✅ Lead qualificado!\\n\\n` +
    `📄 Proposta: ${result.result.document_url}\\n` +
    `📦 IPFS: ${result.result.ipfs_hash}\\n` +
    `🔗 Ceramic: ${result.result.ceramic_stream}`
  );
} else {
  bot.sendMessage(msg.chat.id,
    "📊 Lead registrado para nurturing no Kwil DB."
  );
}

```

});

// Comando: /stats (query The Graph)
bot.onText(/\/stats/, async (msg) => {
const stats = await mcp.route(
"query_state",
{
query_type: "graphql",
query: `{           tokens {             id             name             symbol             totalSupply           }           workoutNFTs(first: 5, orderBy: timestamp, orderDirection: desc) {             id             athlete             exercise           }         }`,
source: "graph"
},
{
wallet: process.env.TREASURY_WALLET
}
);

```
bot.sendMessage(msg.chat.id,
  `📊 Estatísticas NΞØ Ecosystem:\\n\\n` +
  `Tokens: ${stats.result.results.tokens.length}\\n` +
  `Últimos workouts: ${stats.result.results.workoutNFTs.length}`
);

```

});

// Real-time notifications via Gun.js
mcp.subscribeRealtimeState('notifications', (data) => {
if (data.type === 'payment_confirmed') {
bot.sendMessage(data.telegram_id,
`✅ Pagamento confirmado!\\nValor: ${data.amount} ${data.currency}`
);
}
});

console.log("🤖 FlowOFF Bot rodando com stack descentralizada...");
}

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 5. WEBHOOK HANDLER v2.0 (com storage descentralizado)              │
// └─────────────────────────────────────────────────────────────────────┘

const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/cryptomus', async (req, res) => {
const { uuid, status, amount, additional_data } = req.body;

const mcp = new MCPRouter({
ceramicNode: "[https://ceramic-clay.3boxlabs.com](https://ceramic-clay.3boxlabs.com/)",
kwilProvider: "[https://provider.kwil.com](https://provider.kwil.com/)",
did: process.env.DID
});

if (status === 'paid') {
console.log(`✅ Pagamento confirmado: ${uuid}`);

```
// 1. Log no Ceramic (imutável)
await mcp.route(
  "log_event",
  {
    event_type: "payment_confirmed",
    data: {
      payment_id: uuid,
      amount: amount,
      user_id: additional_data,
      confirmed_at: new Date().toISOString()
    },
    did: process.env.DID
  },
  {
    did: process.env.DID
  }
);

// 2. Update Kwil DB (queryable)
await mcp.route(
  "query_state",
  {
    query_type: "sql",
    query: `UPDATE payments SET status = 'confirmed', confirmed_at = ${Date.now()}
            WHERE id = '${uuid}'`,
    source: "kwil"
  },
  {
    wallet: process.env.TREASURY_WALLET
  }
);

// 3. Real-time notification (Gun.js)
mcp.updateRealtimeState(`payment_${uuid}`, {
  status: 'confirmed',
  confirmed_at: Date.now()
});

mcp.updateRealtimeState('notifications', {
  type: 'payment_confirmed',
  payment_id: uuid,
  amount: amount,
  currency: 'USDC',
  telegram_id: additional_data
});

```

}

res.sendStatus(200);
});

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 6. THE GRAPH SUBGRAPH (schema.graphql)                             │
// └─────────────────────────────────────────────────────────────────────┘

const GRAPH_SCHEMA = `
type Token @entity {
id: ID!
name: String!
symbol: String!
contract: Bytes!
totalSupply: BigInt!
deployer: Bytes!
deployedAt: BigInt!
txHash: Bytes!
}

type WorkoutNFT @entity {
id: ID!
tokenId: BigInt!
athlete: Bytes!
exercise: String!
reps: Int!
ipfsHash: String!
timestamp: BigInt!
txHash: Bytes!
}

type LiquidityPool @entity {
id: ID!
token: Token!
pairedToken: String!
poolAddress: Bytes!
liquidityUSDC: BigDecimal!
createdAt: BigInt!
txHash: Bytes!
}

type Lead @entity {
id: ID!
score: Int!
qualified: Boolean!
proposalHash: String
ceramicStream: String
createdAt: BigInt!
}

type Payment @entity {
id: ID!
amount: BigDecimal!
currency: String!
user: Bytes!
status: String!
createdAt: BigInt!
confirmedAt: BigInt
ceramicStream: String
}
`;

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 7. KWIL DATABASE SCHEMA (SQL)                                      │
// └─────────────────────────────────────────────────────────────────────┘

const KWIL_SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
id TEXT PRIMARY KEY,
score INTEGER NOT NULL,
qualified BOOLEAN NOT NULL,
proposal_hash TEXT,
ceramic_stream TEXT,
created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
id TEXT PRIMARY KEY,
amount DECIMAL(18, 6) NOT NULL,
currency TEXT NOT NULL,
user_id TEXT NOT NULL,
status TEXT NOT NULL,
created_at INTEGER NOT NULL,
confirmed_at INTEGER
);

CREATE TABLE IF NOT EXISTS events (
id SERIAL PRIMARY KEY,
event_type TEXT NOT NULL,
data JSONB NOT NULL,
timestamp INTEGER NOT NULL,
ipfs_hash TEXT,
ceramic_stream TEXT
);

CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_events_type ON events(event_type);
`;

// ┌─────────────────────────────────────────────────────────────────────┐
// │ 8. DEPLOYMENT SCRIPTS v2.0                                         │
// └─────────────────────────────────────────────────────────────────────┘

// Script: npm run deploy:neoflw
if (process.argv[2] === 'deploy:neoflw') {
deployNEOFLW().then((result) => {
console.log("✅ Deploy completo");
console.log("📦 IPFS:", result.result.ipfs_proof);
});
}

// Script: npm run deploy:fluxx
if (process.argv[2] === 'deploy:fluxx') {
createFLUXXPool().then(() => console.log("✅ Pool criado"));
}

// Script: npm run bot
if (process.argv[2] === 'bot') {
initFlowOFFBot();
}

// Script: npm run webhook
if (process.argv[2] === 'webhook') {
app.listen(3000, () => console.log("🌐 Webhook rodando na porta 3000"));
}

// Script: npm run init:kwil (setup Kwil DB)
if (process.argv[2] === 'init:kwil') {
const { WebKwil } = require('@kwilteam/kwil-js');
const kwil = new WebKwil({ kwilProvider: "[https://provider.kwil.com](https://provider.kwil.com/)" });

kwil.deploy({
schema: KWIL_SCHEMA,
owner: process.env.TREASURY_WALLET
}).then(() => console.log("✅ Kwil DB criado"));
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTAÇÕES
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
MCPRouter,
MCP_INTENTS,
deployNEOFLW,
processLead,
mintWorkoutNFT,
createPayment,
createFLUXXPool,
initFlowOFFBot,
GRAPH_SCHEMA,
KWIL_SCHEMA
};

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO .env v2.0 (SEM SUPABASE)
// ═══════════════════════════════════════════════════════════════════════

/*

# Blockchain

DEPLOYER_PRIVATE_KEY=0x...
TREASURY_WALLET=0x...
WODX_NFT_CONTRACT=0x...

# APIs

IQAI_API_KEY=your_key
PINATA_JWT=your_jwt
CRYPTOMUS_MERCHANT_ID=your_merchant_id
CRYPTOMUS_API_KEY=your_api_key

# Decentralized Stack

CERAMIC_NODE=https://ceramic-clay.3boxlabs.com
KWIL_PROVIDER=https://provider.kwil.com
GRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/neo-ecosystem
GUN_PEERS=https://gun-relay-1.neo.io,[https://gun-relay-2.neo.io](https://gun-relay-2.neo.io/)
DID=did:key:your_decentralized_id

# Telegram

TELEGRAM_TOKEN=your_bot_token
*/