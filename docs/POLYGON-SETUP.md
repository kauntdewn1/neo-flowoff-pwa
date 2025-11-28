# 🚀 Setup Polygon Mainnet - Protocolo NΞØ

## ✅ Configuração Atual

**Contrato NEOFLW Token:**
- **Endereço**: `0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87`
- **Rede**: Polygon Mainnet (Chain ID: 137)
- **Token**: NEOFLW (NeoFlowOFF)
- **Decimals**: 18

## 📋 Checklist de Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Thirdweb
THIRDWEB_CLIENT_ID=seu_client_id_aqui
THIRDWEB_SECRET_KEY=seu_secret_key_aqui

# Polygon RPC (Infura - já configurado)
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/9afb8749df8f4370aded1dce851d13f4
```

### 2. Obter Thirdweb Client ID

1. Acesse: https://thirdweb.com/dashboard
2. Crie um novo projeto ou use existente
3. Copie o **Client ID**
4. Para operações backend, gere um **Secret Key**

### 3. RPC Provider

**Configurado**: Infura Polygon Mainnet
- **URL**: `https://polygon-mainnet.infura.io/v3/9afb8749df8f4370aded1dce851d13f4`
- **Status**: ✅ Ativo e configurado

**⚠️ IMPORTANTE**: O token NEOFLW está em **Polygon Mainnet (PRODUÇÃO)**, não em testnet.

### 4. Verificar Contrato

O contrato já está deployado e verificado:
- **Etherscan Polygon**: https://polygonscan.com/token/0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87

## 🧪 Testar Conexão

```javascript
// No console do navegador ou script de teste
const router = window.NEOPROTOCOL.router;
const token = router.getModule('token');

// Verificar saldo (precisa de wallet conectada)
const balance = await token.getBalance('0x...');
console.log('Saldo NEOFLW:', balance.formatted);
```

## 🔧 Configuração Atual

O sistema está configurado para:

- ✅ **Polygon Mainnet (PRODUÇÃO)** como rede padrão
- ✅ **Contrato** `0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87`
- ✅ **RPC Infura** configurado e ativo
- ✅ **Thirdweb SDK** integrado
- ⚠️ **Token NÃO existe em testnet** - apenas Polygon Mainnet

## 📝 Próximos Passos

1. **Configurar .env** com suas chaves
2. **Testar conexão** com o contrato
3. **Validar saldos** de wallets de teste
4. **Implementar UI** para exibir tokens

---

**Status**: ✅ Configurado para Polygon Mainnet  
**Data**: 2025-01-27

