#!/usr/bin/env node
/**
 * Script para configurar Wasabi e testar conectividade
 * Uso: node scripts/setup-wasabi.js
 */

import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WasabiSetup {
  constructor() {
    this.s3Client = null;
    this.config = {
      accessKey: process.env.VITE_WASABI_ACCESS_KEY,
      secretKey: process.env.VITE_WASABI_SECRET_KEY,
      region: process.env.VITE_WASABI_REGION,
      bucket: process.env.VITE_WASABI_BUCKET,
      endpoint: process.env.VITE_WASABI_ENDPOINT
    };
  }

  async initialize() {
    console.log('🔧 Configurando Wasabi...\n');

    // Verificar configurações
    const missingConfigs = this.checkRequiredConfigs();
    if (missingConfigs.length > 0) {
      console.error('❌ Configurações faltando:\n');
      missingConfigs.forEach(config => {
        console.error(`   - ${config}`);
      });
      console.error('\n📝 Crie um arquivo .env com essas variáveis. Veja o exemplo em wasabi-config-guide.md');
      process.exit(1);
    }

    // Inicializar cliente S3
    try {
      this.s3Client = new S3Client({
        region: this.config.region,
        endpoint: this.config.endpoint,
        credentials: {
          accessKeyId: this.config.accessKey,
          secretAccessKey: this.config.secretKey,
        },
        forcePathStyle: true,
      });
      console.log('✅ Cliente S3 inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar cliente S3:', error.message);
      process.exit(1);
    }
  }

  checkRequiredConfigs() {
    const required = [
      'VITE_WASABI_ACCESS_KEY',
      'VITE_WASABI_SECRET_KEY',
      'VITE_WASABI_REGION',
      'VITE_WASABI_BUCKET',
      'VITE_WASABI_ENDPOINT'
    ];

    return required.filter(key => !process.env[key]);
  }

  async testConnection() {
    console.log('\n🔍 Testando conexão com Wasabi...');

    try {
      const command = new ListObjectsCommand({
        Bucket: this.config.bucket,
        MaxKeys: 1
      });

      await this.s3Client.send(command);
      console.log('✅ Conexão com Wasabi estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com Wasabi:', error.message);
      
      if (error.name === 'NoSuchBucket') {
        console.error(`   💡 O bucket "${this.config.bucket}" não existe. Crie-o no painel do Wasabi.`);
      } else if (error.name === 'InvalidAccessKeyId') {
        console.error('   💡 Verifique suas credenciais de API no arquivo .env');
      } else if (error.name === 'SignatureDoesNotMatch') {
        console.error('   💡 Verifique sua Secret Key no arquivo .env');
      }
      
      return false;
    }
  }

  async createInitialStructure() {
    console.log('\n📁 Criando estrutura inicial de pastas...');

    const folders = ['videos', 'thumbnails', 'metadata'];
    
    for (const folder of folders) {
      try {
        // Criar um arquivo marcador para garantir que a pasta existe
        const markerKey = `${folder}/.keep`;
        const command = new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: markerKey,
          Body: Buffer.from(''),
          ContentType: 'text/plain',
        });

        await this.s3Client.send(command);
        console.log(`✅ Pasta ${folder}/ criada`);

        // Remover arquivo marcador
        const deleteCommand = new ListObjectsCommand({
          Bucket: this.config.bucket,
          Prefix: markerKey
        });
        
      } catch (error) {
        console.error(`❌ Erro ao criar pasta ${folder}/:`, error.message);
      }
    }
  }

  async createInitialData() {
    console.log('\n📄 Criando arquivo inicial de dados...');

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
        telegramUsername: 'nlyadm19',
        videoListTitle: 'Available Videos',
        crypto: [],
        emailHost: 'smtp.gmail.com',
        emailPort: '587',
        emailSecure: false,
        emailUser: '',
        emailPass: '',
        emailFrom: '',
        wasabiConfig: {
          accessKey: this.config.accessKey,
          secretKey: this.config.secretKey,
          region: this.config.region,
          bucket: this.config.bucket,
          endpoint: this.config.endpoint
        }
      }
    };

    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: 'metadata/videosplus-data.json',
        Body: JSON.stringify(initialData, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      console.log('✅ Arquivo inicial de dados criado');
      console.log('   👤 Usuário admin: admin@gmail.com');
      console.log('   🔑 Senha admin: admin123');
    } catch (error) {
      console.error('❌ Erro ao criar arquivo inicial de dados:', error.message);
    }
  }

  async listBucketContents() {
    console.log('\n📋 Conteúdo atual do bucket:');

    try {
      const command = new ListObjectsCommand({
        Bucket: this.config.bucket,
        MaxKeys: 100
      });

      const response = await this.s3Client.send(command);
      
      if (response.Contents && response.Contents.length > 0) {
        response.Contents.forEach(obj => {
          console.log(`   📄 ${obj.Key} (${Math.round(obj.Size / 1024)} KB)` );
        });
      } else {
        console.log('   📭 Bucket vazio');
      }
    } catch (error) {
      console.error('❌ Erro ao listar conteúdo do bucket:', error.message);
    }
  }

  validateConfig() {
    console.log('\n🔧 Validadando configurações...');

    const validations = [
      {
        name: 'Access Key',
        value: this.config.accessKey,
        validator: (val) => val && val.length > 10
      },
      {
        name: 'Secret Key', 
        value: this.config.secretKey,
        validator: (val) => val && val.length > 10
      },
      {
        name: 'Region',
        value: this.config.region,
        validator: (val) => val && val.includes('-')
      },
      {
        name: 'Bucket',
        value: this.config.bucket,
        validator: (val) => val && val.length > 0
      },
      {
        name: 'Endpoint',
        value: this.config.endpoint,
        validator: (val) => val && val.startsWith('https://')
      }
    ];

    validations.forEach(validation => {
      if (validation.validator(validation.value)) {
        console.log(`✅ ${validation.name}: OK`);
      } else {
        console.log(`❌ ${validation.name}: Inválido`);
      }
    });
  }

  async run() {
    await this.initialize();
    this.validateConfig();
    
    const connected = await this.testConnection();
    if (!connected) {
      process.exit(1);
    }

    await this.createInitialStructure();
    await this.createInitialData();
    await this.listBucketContents();

    console.log('\n🎉 Configuração do Wasabi concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute: npm run dev:all');
    console.log('   2. Acesse: http://localhost:3000/admin');
    console.log('   3. Login: admin@gmail.com / admin123');
    console.log('   4. Configure domínio/pagamentos nas configurações');
  }
}

// Executar setup
const setup = new WasabiSetup();
setup.run().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
