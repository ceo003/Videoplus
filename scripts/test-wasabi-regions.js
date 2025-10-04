#!/usr/bin/env node
/**
 * Script para testar diferentes regiões do Wasabi
 */

import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const regions = [
  { name: 'us-central-1', endpoint: 'https://s3.us-central-1.wasabisys.com' },
  { name: 'us-east-1', endpoint: 'https://s3.us-east-1.wasabisys.com' },
  { name: 'us-west-1', endpoint: 'https://s3.us-west-1.wasabisys.com' },
  { name: 'eu-central-1', endpoint: 'https://s3.eu-central-1.wasabisys.com' },
  { name: 'eu-central-2', endpoint: 'https://s3.eu-central-2.wasabisys.com' },
  { name: 'ap-northeast-1', endpoint: 'https://s3.ap-northeast-1.wasabisys.com' }
];

const bucket = 'videosplus-2024';
const accessKey = 'MG6BCFEBPI30TV9J5QJB';
const secretKey = '8stlTUnBbB0WaQte9T7zo1iJTANYVeA9j9TFQAw8';

async function testRegion(region) {
  try {
    const s3Client = new S3Client({
      region: region.name,
      endpoint: region.endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });

    const command = new ListObjectsCommand({
      Bucket: bucket,
      MaxKeys: 1
    });

    await s3Client.send(command);
    console.log(`✅ ${region.name} - FUNCIONA!`);
    return { region, success: true };
  } catch (error) {
    console.log(`❌ ${region.name} - ${error.name}: ${error.message}`);
    return { region, success: false, error: error.message };
  }
}

async function testAllRegions() {
  console.log('🔍 Testando regiões do Wasabi...\n');
  console.log(`Bucket: ${bucket}`);
  console.log(`Access Key: ${accessKey}\n`);

  const results = [];
  
  for (const region of regions) {
    const result = await testRegion(region);
    results.push(result);
  }

  console.log('\n📋 Resumo:');
  const workingRegions = results.filter(r => r.success);
  
  if (workingRegions.length > 0) {
    console.log('\n✅ Regiões que funcionam:');
    workingRegions.forEach(r => {
      console.log(`   - ${r.region.name} (${r.region.endpoint})`);
    });
    
    console.log('\n🔧 Use esta configuração no .env:');
    const bestRegion = workingRegions[0];
    console.log(`VITE_WASABI_REGION=${bestRegion.region.name}`);
    console.log(`VITE_WASABI_ENDPOINT=${bestRegion.region.endpoint}`);
  } else {
    console.log('\n❌ Nenhuma região funcionou. Verifique:');
    console.log('   1. Se o bucket existe');
    console.log('   2. Se as credenciais estão corretas');
    console.log('   3. Se o bucket está na região correta');
  }
}

testAllRegions().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
