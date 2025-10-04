#!/usr/bin/env node
/**
 * Script para inicializar banco de dados no Wasabi
 * Executar: node init-database.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BASE_URL = 'https://videosplus-gemilson-app.onrender.com';

async function initializeDatabase() {
  console.log('🔧 Inicializando banco de dados VideosPlus...\n');

  try {
    // 1. Verificar status do servidor
    console.log('1️⃣ Verificando saúde do servidor...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Servidor:', healthData.status);

    // 2. Verificar backup/status Wasabi
    console.log('\n2️⃣ Verificando conexão com Wasabi...');
    const backupResponse = await fetch(`${BASE_URL}/api/backup/status`);
    const backupData = await backupResponse.json();
    console.log('📊 Backup status:', backupData);

    // 3. Criar dados iniciais via upload metadata
    console.log('\n3️⃣ Criando dados iniciais...');
    
    const initialData = {
      videos: [],
      users: [
        {
          id: 'admin-001',
          email: 'admin@gmail.com',
          name: 'Administrador',
          password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
          createdAt: new Date().toISOString()
        }
      ],
      sessions: [],
      siteConfig: {
        siteName: 'VideosPlus',
        paypalClientId: '',
        paypalMeUsername: '',
        stripePublishableKey: '',
        stripeSecretKey: '',
        telegramUsername: '',
        videoListTitle: 'Available Videos',
        crypto: [],
        emailHost: 'smtp.gmail.com',
        emailPort: '587',
        emailSecure: false,
        emailUser: '',
        emailPass: '',
        emailFrom: '',
        wasabiConfig: {
          accessKey: process.env.VITE_WASABI_ACCESS_KEY,
          secretKey: process.env.VITE_WASABI_SECRET_KEY,
          region: process.env.VITE_WASABI_REGION,
          bucket: process.env.VITE_WASABI_BUCKET,
          endpoint: process.env.VITE_WASABI_ENDPOINT
        }
      }
    };

    // Criar FormData para upload
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(initialData, null, 2)], { type: 'application/json' });
    formData.append('file', blob, 'videosplus-data.json');

    const uploadResponse = await fetch(`${BASE_URL}/api/upload/metadata`, {
      method: 'POST',
      body: formData
    });

    if (uploadResponse.ok) {
      console.log('✅ Dados iniciais criados com sucesso!');
    } else {
      console.log('❌ Erro ao criar dados iniciais:', uploadResponse.status);
    }

    // 4. Testar login
    console.log('\n4️⃣ Testando login admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/users/email/admin@gmail.com`);
    
    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log('✅ Usuário admin encontrado:', userData.email);
    } else {
      console.log('❌ Usuário admin não encontrado');
    }

    console.log('\n🎉 Inicialização concluída!');
    console.log('📱 Acesse: https://videosplus-gemilson-app.onrender.com/admin');
    console.log('👤 Login: admin@gmail.com / admin123');

  } catch (error) {
    console.error('❌ Erro na inicialização:', error.message);
  }
}

// Executar inicialização
initializeDatabase();
