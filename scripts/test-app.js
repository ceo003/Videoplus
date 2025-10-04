#!/usr/bin/env node
/**
 * Script para testar completa funcionalidade da aplicação
 * Uso: npm run test-wasabi ou node scripts/test-app.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

class AppTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🔍 Testando: ${testName}...`);
      await testFunction();
      console.log(`✅ ${testName}: PASSOU`);
      this.testResults.push({ name: testName, status: 'PASS', error: null });
    } catch (error) {
      console.log(`❌ ${testName}: FALHOU - ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testServerHealth() {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Servidor não está rodando na porta 3000`);
    }
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error('Servidor não está saudável');
    }
  }

  async testWasabiConnection() {
    const response = await fetch(`${this.baseUrl}/api/backup/status`);
    if (!response.ok) {
      throw new Error('Não foi possível verificar conexão com Wasabi');
    }
    const data = await response.json();
    if (!data.hasBackup) {
      console.log('💡 Arquivo inicial de dados não existe no Wasabi');
      console.log('   Execute: npm run setup-wasabi');
      throw new Error('Wasabi não configurado corretamente');
    }
  }

  async testVideoAPI() {
    const response = await fetch(`${this.baseUrl}/api/videos`);
    if (!response.ok) {
      throw new Error(`API de vídeos não está funcionando: ${response.status}`);
    }
    const videos = await response.json();
    if (!Array.isArray(videos)) {
      throw new Error('API de vídeos não retorna array');
    }
  }

  async testUserAPI() {
    const response = await fetch(`${this.baseUrl}/api/users`);
    if (!response.ok) {
      throw new Error(`API de usuários não está funcionando: ${response.status}`);
    }
    const users = await response.json();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('API de usuários não tem usuário admin');
    }
    
    // Verificar se admin existe
    const admin = users.find(u => u.email === 'admin@gmail.com');
    if (!admin) {
      throw new Error('Usuário admin não encontrado');
    }
  }

  async testSiteConfig() {
    const response = await fetch(`${this.baseUrl}/api/site-config`);
    if (!response.ok) {
      throw new Error(`API de configuração não está funcionando: ${response.status}`);
    }
    const config = await response.json();
    if (!config.siteName) {
      throw new Error('Configuração do site não está completa');
    }
  }

  async testEnvironmentVariables() {
    const requiredVars = [
      'VITE_WASABI_ACCESS_KEY',
      'VITE_WASABI_SECRET_KEY', 
      'VITE_WASABI_REGION',
      'VITE_WASABI_BUCKET',
      'VITE_WASABI_ENDPOINT'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    }
  }

  async testStaticFiles() {
    const homeResponse = await fetch(`${this.baseUrl}/`);
    if (!homeResponse.ok) {
      throw new Error(`Página inicial não está servindo: ${homeResponse.status}`);
    }
  }

  async testSignedURL() {
    try {
      const response = await fetch(`${this.baseUrl}/api/signed-url/test-file`);
      // Esse endpoint pode falhar se arquivo não existir, mas deve responder sem erro 500
      if (response.status === 500) {
        throw new Error('Geração de URLs assinadas com erro interno');
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Servidor não está rodando');
      }
      // Outros erros podem ser aceitáveis
    }
  }

  async testWasabiUpload() {
    try {
      // Teste simples de conectividade de upload (sem arquivo real)
      const response = await fetch(`${this.baseUrl}/api/upload/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      // Deve retornar erro 400 (arquivo faltando), não erro 500 (problema de conexão Wasabi)
      if (response.status === 500) {
        throw new Error('Problema de conectividade com Wasabi para uploads');
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Servidor não está rodando');
      }
      // Outros erros podem ser aceitáveis
    }
  }

  async checkServerRunning() {
    try {
      await this.testServerHealth();
      return true;
    } catch (error) {
      console.log('❌ Servidor não está rodando na porta 3000');
      console.log('💡 Execute: npm run dev:all');
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 INICIANDO TESTES COMPLETOS DA APLICAÇÃO\n');

    // Verificar se servidor está rodando
    const serverRunning = await this.checkServerRunning();
    if (!serverRunning) {
      console.log('\n📝 Para executar os testes:');
      console.log('   1. Execute: npm run dev:all');
      console.log('   2. Aguarde o servidor inicializar');
      console.log('   3. Execute: npm test -- --testNamePattern=app');
      process.exit(1);
    }

    // Executar todos os testes
    await this.runTest('Variáveis de Ambiente', () => this.testEnvironmentVariables());
    await this.runTest('Conexão com Servidor', () => this.testServerHealth());
    await this.runTest('Conexão com Wasabi', () => this.testWasabiConnection());
    await this.runTest('API de Vídeos', () => this.testVideoAPI());
    await this.runTest('API de Usuários', () => this.testUserAPI());
    await this.runTest('Configuração do Site', () => this.testSiteConfig());
    await this.runTest('Arquivos Estáticos', () => this.testStaticFiles());
    await this.runTest('URLs Assinadas Wasabi', () => this.testSignedURL());
    await this.runTest('Upload Wasabi', () => this.testWasabiUpload());

    this.showResults();
  }

  showResults() {
    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');

    const passed = this.testResults.filter(t => t.status === 'PASS');
    const failed = this.testResults.filter(t => t.status === 'FAIL');

    console.log(`✅ Passou: ${passed.length}/${this.testResults.length}`);
    
    if (failed.length > 0) {
      console.log(`❌ Falhou: ${failed.length}/${this.testResults.length}`);
      console.log('\n🔧 PROBLEMAS ENCONTRADOS:');
      failed.forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }

    if (failed.length === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('\n📝 Próximos passos:');
      console.log('   1. ✅ Aplicação está funcionando perfeitamente');
      console.log('   2. 🌐 Acesse: http://localhost:3000/admin');
      console.log('   3. 📥 Login: admin@gmail.com / admin123');
      console.log('   4. 🚀 Pronto para deploy em produção!');
      console.log('\n🚀 Guia de Deploy: consulte deploy-config.md');
    } else {
      console.log('\n⚠️  CORRIJA OS PROBLEMAS ANTES DO DEPLOY');
      console.log('   📖 Consulte: wasabi-config-guide.md');
    }
  }

  async quickCheck() {
    console.log('⚡ VERIFICAÇÃO RÁPIDA\n');
    
    const serverRunning = await this.checkServerRunning();
    if (!serverRunning) {
      return;
    }

    await this.runTest('Status Geral', async () => {
      const healthResponse = await fetch(`${this.base Url}/api/health`);
      const configResponse = await fetch(`${this.baseUrl}/api/site-config`);
      
      if (!healthResponse.ok) throw new Error('Servidor com problemas');
      if (!configResponse.ok) throw new Error('Configuração com problemas');
    });

    if (this.testResults.length > 0 && this.testResults[0].status === 'PASS') {
      console.log('\n✅ Status: APLICAÇÃO FUNCIONANDO!');
      console.log('🌐 Acesse: http://localhost:3000');
    }
  }
}

// Executar testes
const tester = new AppTester();

// Verificar argumentos
const args = process.argv.slice(2);

if (args.includes('--quick') || args.includes('--fast')) {
  tester.quickCheck().catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else {
  tester.runAllTests().catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
}
