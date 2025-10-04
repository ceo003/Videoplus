#!/usr/bin/env node
/**
 * Script para inicializar dados no Wasabi
 * Uso: node scripts/init-wasabi-data.js
 */

import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

class WasabiDataInitializer {
  constructor() {
    this.s3Client = new S3Client({
      region: 'us-central-1',
      endpoint: 'https://s3.us-central-1.wasabisys.com',
      credentials: {
        accessKeyId: 'MG6BCFEBPI30TV9J5QJB',
        secretAccessKey: '8stlTUnBbB0WaQte9T7zo1iJTANYVeA9j9TFQAw8',
      },
      forcePathStyle: true,
    });
    
    this.bucket = 'videosplus-2024';
    this.metadataKey = 'metadata/videosplus-data.json';
  }

  async checkBucketExists() {
    try {
      const command = new ListObjectsCommand({
        Bucket: this.bucket,
        MaxKeys: 1
      });
      
      await this.s3Client.send(command);
      console.log('✅ Bucket existe e é acessível');
      return true;
    } catch (error) {
      console.error('❌ Erro ao acessar bucket:', error.message);
      return false;
    }
  }

  async checkMetadataExists() {
    try {
      const command = new ListObjectsCommand({
        Bucket: this.bucket,
        Prefix: this.metadataKey
      });
      
      const response = await this.s3Client.send(command);
      const exists = response.Contents && response.Contents.length > 0;
      
      if (exists) {
        console.log('✅ Arquivo de metadados já existe');
      } else {
        console.log('❌ Arquivo de metadados não encontrado');
      }
      
      return exists;
    } catch (error) {
      console.error('❌ Erro ao verificar metadados:', error.message);
      return false;
    }
  }

  async createInitialData() {
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
          accessKey: process.env.VITE_WASABI_ACCESS_KEY || '',
          secretKey: process.env.VITE_WASABI_SECRET_KEY || '',
          region: process.env.VITE_WASABI_REGION || 'us-central-1',
          bucket: this.bucket,
          endpoint: process.env.VITE_WASABI_ENDPOINT || 'https://s3.us-central-1.wasabisys.com'
        }
      }
    };

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.metadataKey,
        Body: JSON.stringify(initialData, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      console.log('✅ Dados iniciais criados com sucesso');
      console.log('   👤 Usuário admin: admin@gmail.com');
      console.log('   🔑 Senha admin: admin123');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados iniciais:', error.message);
      return false;
    }
  }

  async run() {
    console.log('🔧 Inicializando dados no Wasabi...\n');
    
    // Verificar configurações
    console.log('📋 Configurações:');
    console.log(`   Bucket: ${this.bucket}`);
    console.log(`   Região: ${process.env.VITE_WASABI_REGION || 'us-central-1'}`);
    console.log(`   Endpoint: ${process.env.VITE_WASABI_ENDPOINT || 'https://s3.us-central-1.wasabisys.com'}`);
    console.log(`   Access Key: ${process.env.VITE_WASABI_ACCESS_KEY ? '***' + process.env.VITE_WASABI_ACCESS_KEY.slice(-4) : 'NÃO DEFINIDA'}\n`);

    // Verificar se bucket existe
    const bucketExists = await this.checkBucketExists();
    if (!bucketExists) {
      console.error('❌ Não foi possível acessar o bucket. Verifique as credenciais e configurações.');
      process.exit(1);
    }

    // Verificar se metadados existem
    const metadataExists = await this.checkMetadataExists();
    
    if (!metadataExists) {
      console.log('\n📄 Criando dados iniciais...');
      const created = await this.createInitialData();
      
      if (created) {
        console.log('\n🎉 Inicialização concluída com sucesso!');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Faça commit e push das mudanças');
        console.log('   2. Faça redeploy no Render');
        console.log('   3. Teste o login: admin@gmail.com / admin123');
      } else {
        console.error('\n❌ Falha ao criar dados iniciais');
        process.exit(1);
      }
    } else {
      console.log('\n✅ Dados já existem no Wasabi');
    }
  }
}

// Executar inicialização
const initializer = new WasabiDataInitializer();
initializer.run().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
