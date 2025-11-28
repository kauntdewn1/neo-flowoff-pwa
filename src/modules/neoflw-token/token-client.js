/**
 * NEOFLW Token Client
 * Integração com contrato NEOFLW na Polygon
 * 
 * Contrato Sepolia Testnet: 0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87
 * Próximo: Deploy Polygon Mainnet
 */

import { logger } from '../../utils/logger.js';
import { getIdentityGraph } from '../neo-id/identity-graph.js';

class NEOFLWTokenClient {
  constructor() {
    // Contrato Sepolia (testnet)
    this.contractAddress = {
      sepolia: '0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87',
      polygon: null // Será configurado após deploy mainnet
    };
    
    this.currentChain = 'sepolia'; // MVP: Sepolia, depois Polygon
    this.sdk = null; // Thirdweb SDK será inicializado
    this.wallet = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa cliente com Thirdweb SDK
   */
  async init(thirdwebSDK) {
    try {
      this.sdk = thirdwebSDK;
      
      // Obter wallet do Identity Graph
      const identity = getIdentityGraph().getIdentity();
      if (identity?.wallet) {
        this.wallet = identity.wallet;
      }
      
      this.isInitialized = true;
      logger.log('NEOFLW: Cliente inicializado');
      return true;
    } catch (error) {
      logger.error('NEOFLW: Erro ao inicializar', error);
      return false;
    }
  }

  /**
   * Obtém saldo do token
   */
  async getBalance(address = null) {
    if (!this.isInitialized) {
      throw new Error('NEOFLW: Cliente não inicializado');
    }

    try {
      const targetAddress = address || this.wallet;
      if (!targetAddress) {
        throw new Error('NEOFLW: Endereço de wallet necessário');
      }

      // Usar Thirdweb SDK para ler saldo
      const contract = await this.sdk.getContract(
        this.contractAddress[this.currentChain]
      );
      
      const balance = await contract.erc20.balanceOf(targetAddress);
      
      logger.log('NEOFLW: Saldo obtido', balance.displayValue);
      return {
        raw: balance.value,
        formatted: balance.displayValue,
        decimals: 18
      };
    } catch (error) {
      logger.error('NEOFLW: Erro ao obter saldo', error);
      throw error;
    }
  }

  /**
   * Transfere tokens
   */
  async transfer(to, amount) {
    if (!this.isInitialized || !this.wallet) {
      throw new Error('NEOFLW: Wallet não conectada');
    }

    try {
      const contract = await this.sdk.getContract(
        this.contractAddress[this.currentChain]
      );

      // Converter amount para formato correto (considerando 18 decimals)
      const amountWei = this.parseAmount(amount);
      
      const tx = await contract.erc20.transfer(to, amountWei);
      
      logger.log('NEOFLW: Transferência iniciada', tx);
      
      // Atualizar Identity Graph
      const identity = getIdentityGraph();
      identity.recordPurchase({
        type: 'transfer',
        to,
        amount: amountWei,
        txHash: tx.receipt?.transactionHash
      });
      
      return tx;
    } catch (error) {
      logger.error('NEOFLW: Erro na transferência', error);
      throw error;
    }
  }

  /**
   * Queima tokens (burn)
   */
  async burn(amount) {
    if (!this.isInitialized || !this.wallet) {
      throw new Error('NEOFLW: Wallet não conectada');
    }

    try {
      const contract = await this.sdk.getContract(
        this.contractAddress[this.currentChain]
      );

      const amountWei = this.parseAmount(amount);
      const tx = await contract.call('burn', [amountWei]);
      
      logger.log('NEOFLW: Tokens queimados', tx);
      return tx;
    } catch (error) {
      logger.error('NEOFLW: Erro ao queimar tokens', error);
      throw error;
    }
  }

  /**
   * Converte amount para wei (18 decimals)
   */
  parseAmount(amount) {
    // Se já é string em formato wei, retorna
    if (typeof amount === 'string' && amount.includes('.')) {
      // Converter decimal para wei
      const [integer, decimal = ''] = amount.split('.');
      const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
      return integer + paddedDecimal;
    }
    return amount;
  }

  /**
   * Formata amount de wei para decimal
   */
  formatAmount(weiAmount) {
    const str = weiAmount.toString();
    if (str.length <= 18) {
      return '0.' + str.padStart(18, '0');
    }
    const integer = str.slice(0, -18);
    const decimal = str.slice(-18);
    return integer + '.' + decimal;
  }

  /**
   * Obtém informações do contrato
   */
  async getContractInfo() {
    if (!this.isInitialized) {
      throw new Error('NEOFLW: Cliente não inicializado');
    }

    try {
      const contract = await this.sdk.getContract(
        this.contractAddress[this.currentChain]
      );

      const [name, symbol, totalSupply] = await Promise.all([
        contract.erc20.name(),
        contract.erc20.symbol(),
        contract.erc20.totalSupply()
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.displayValue,
        address: this.contractAddress[this.currentChain],
        chain: this.currentChain
      };
    } catch (error) {
      logger.error('NEOFLW: Erro ao obter info do contrato', error);
      throw error;
    }
  }
}

// Singleton
let tokenClientInstance = null;

export function getNEOFLWClient() {
  if (!tokenClientInstance) {
    tokenClientInstance = new NEOFLWTokenClient();
  }
  return tokenClientInstance;
}

export default NEOFLWTokenClient;

