/**
 * Configuração do Protocolo NΞØ
 * Centraliza todas as configurações do ecossistema
 */

export const NEO_PROTOCOL_CONFIG = {
  // Blockchain
  blockchain: {
    // Polygon Mainnet (produção)
    polygon: {
      chainId: 137,
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/9afb8749df8f4370aded1dce851d13f4',
      contractAddress: '0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87',
      tokenName: 'NeoFlowOFF',
      tokenSymbol: 'NEOFLW',
      decimals: 18
    },
    // Sepolia Testnet (apenas para testes/desenvolvimento - NÃO usar em produção)
    // NOTA: O token NEOFLW está em Polygon Mainnet, não em testnet
    sepolia: {
      chainId: 11155111,
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
      contractAddress: null, // Token não existe em testnet
      tokenName: 'NeoFlowOFF',
      tokenSymbol: 'NEOFLW',
      decimals: 18
    }
  },

  // Thirdweb
  thirdweb: {
    clientId: process.env.THIRDWEB_CLIENT_ID || '',
    secretKey: process.env.THIRDWEB_SECRET_KEY || '',
    defaultChain: 'polygon' // Polygon Mainnet como padrão
  },

  // Gamification
  gamification: {
    xpPerLevel: 100,
    pointsToNEOFLW: 100, // 100 pontos = 1 NEOFLW
    conversionRate: 0.1 // 1 BRL = 0.1 NEOFLW (exemplo)
  },

  // FlowPay
  flowpay: {
    apiUrl: process.env.FLOWPAY_API_URL || 'https://flowpaycash.netlify.app/api',
    cashbackPercent: 0.05, // 5% cashback
    pixExpirationMinutes: 30
  },

  // Identity Graph
  identity: {
    storage: {
      type: 'localStorage', // 'localStorage' | 'postgresql' | 'hybrid'
      postgresUrl: process.env.DATABASE_URL || null
    }
  },

  // Descentralizado (Phase 2)
  decentralized: {
    ceramic: {
      nodeUrl: process.env.CERAMIC_NODE_URL || 'https://ceramic-clay.3boxlabs.com',
      enabled: false // Ativar em Phase 2
    },
    kwil: {
      networkUrl: process.env.KWIL_NETWORK_URL || 'https://testnet.kwil.com',
      enabled: false // Ativar em Phase 2
    },
    ipfs: {
      gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
      pinataApiKey: process.env.PINATA_API_KEY || '',
      enabled: false // Ativar em Phase 2
    },
    gun: {
      peers: process.env.GUN_PEERS?.split(',') || [],
      enabled: false // Ativar em Phase 2
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true,
    enableRemote: false
  }
};

export default NEO_PROTOCOL_CONFIG;

