/**
 * Teste Simples - Verificar qual token Invertexto funciona
 * Testa diretamente via API do Invertexto
 */

const tokens = [
  '21976|hZQXuMyP6eW0sydqMCxNC9JLJKSHbsOs',
  '23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm'
];

async function testToken(token, index) {
  console.log(`\n🧪 Testando Token ${index + 1}: ${token.substring(0, 20)}...`);
  
  try {
    // API Invertexto - testar com endpoint validator (mais simples)
    const response = await fetch('https://invertexto.com/api/validator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        type: 'cpf',
        value: '12345678909' // CPF de teste
      })
    });

    const data = await response.json();
    
    if (response.ok && data && !data.error) {
      console.log(`   ✅ Token ${index + 1} FUNCIONA!`);
      console.log(`   📊 Resposta:`, JSON.stringify(data, null, 2));
      return { token, valid: true, data };
    } else {
      console.log(`   ❌ Token ${index + 1} - Erro:`, data?.error || data?.message || 'Resposta inválida');
      return { token, valid: false, error: data?.error || data?.message };
    }
  } catch (error) {
    console.log(`   ❌ Token ${index + 1} - Erro:`, error.message);
    return { token, valid: false, error: error.message };
  }
}

async function main() {
  console.log('\n🔍 TESTE DE TOKENS INVERTEXTO\n');
  console.log('='.repeat(50));
  
  const results = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const result = await testToken(tokens[i], i);
    results.push(result);
    
    // Aguardar entre testes
    if (i < tokens.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 RESUMO\n');
  console.log('='.repeat(50));
  
  const validTokens = results.filter(r => r.valid);
  
  if (validTokens.length === 0) {
    console.log('\n❌ Nenhum token válido encontrado!');
    console.log('\n💡 Verifique:');
    console.log('   1. Se os tokens estão corretos');
    console.log('   2. Se as APIs estão habilitadas no dashboard Invertexto');
    console.log('   3. Se o domínio está autorizado');
  } else {
    console.log(`\n✅ Token válido encontrado:`);
    console.log(`   ${validTokens[0].token}`);
    console.log(`\n📝 Use este token no .env:`);
    console.log(`   INVERTEXTO_API_TOKEN=${validTokens[0].token}`);
  }
}

main().catch(console.error);

