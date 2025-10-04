# 🚀 Guia de Deploy para Produção

## 📋 Checklist Pré-Deploy

### ✅ Pré-requisitos
- [ ] Conta Wasabi configurada e bucket criado
- [ ] Arquivo `.env` configurado com credenciais reais
- [ ] Testado localmente (npm run setup-wasabi)
- [ ] Domínio reservado (opcional)

### ✅ Deploy Platforms Recomendados

## 🎯 Opção 1: Render.com (Mais Fácil - Gratuito)

### 1. Criar Conta
- Acesse: https://render.com/
- Conecte com GitHub

### 2. Importar Repositório 
- Link: https://render.com/dashboard/new/repo
- Selecione seu repositório `MarketingHot`

### 3. Configurar Web Service
```yaml
Name: videosplus-app
Runtime: Node
Build Command: npm install
Start Command: npm run start

# Variáveis de Ambiente (Settings > Environment Variables)
VITE_WASABI_ACCESS_KEY=sua_access_key_aqui
VITE_WASABI_SECRET_KEY=sua_secret_key_aqui  
VITE_WASABI_REGION=us-central-1
VITE_WASABI_BUCKET=seu-bucket-name
VITE_WASABI_ENDPOINT=https://s3.us-central-1.wasabisys.com
NODE_ENV=production
PORT=3000
```

### 4. Deploy Automático
- Render automaticamente faz deploy do `main` branch
- URL será: `https://videosplus-app.onrender.com`

## 🎯 Opção 2: Railway.app (Moderno - Gratuito)

### 1. Criar Conta
- Acesse: https://railway.app/
- Conecte com GitHub

### 2. Deploy Projeto
- New Project > GitHub Repo
- Selecione seu repositório

### 3. Configurar Variables
Na aba Environment:
```bash
VITE_WASABI_ACCESS_KEY=sua_access_key_aqui
VITE_WASABI_SECRET_KEY=sua_secret_key_aqui
VITE_WASABI_REGION=us-central-1
VITE_WASABI_BUCKET=seu-bucket-name  
VITE_WASABI_ENDPOINT=https://s3.us-central-1.wasabisys.com
NODE_ENV=production
```

### 4. Build Settings
```bash
Build Command: npm run build
Start Command: npm run start
```

## 🎯 Opção 3: Heroku (Estável - Pago)

### 1. Criar App
```bash
heroku create videosplus-app
heroku git:remote -a videosplus-app
```

### 2. Configurar Variables
```bash
heroku config:set VITE_WASABI_ACCESS_KEY=sua_access_key_aqui
heroku config:set VITE_WASABI_SECRET_KEY=sua_secret_key_aqui
heroku config:set VITE_WASABI_REGION=us-central-1
heroku config:set VITE_WASABI_BUCKET=seu-bucket-name
heroku config:set VITE_WASABI_ENDPOINT=https://s3.us-central-1.wasabisys.com
heroku config:set NODE_ENV=production
```

### 3. Deploy
```bash
git push heroku main
```

## 🎯 Opção 4: Vercel + Railway (Frontend + Backend)

### Frontend (Vercel)
1. Deploy do frontend estático
2. Configure variáveis de API_URL para backend

### Backend (Railway)
1. Deploy do servidor Node.js
2. Configure todas as variáveis Wasabi

## ⚙️ Configurações Pós-Deploy

### 1. CORS no Wasabi
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://videosplus-app.onrender.com",
      "https://videosplus-production.up.railway.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 2. Verificar Funcionamento
1. Post-deploy: `https://seu-app.com/api/health`
2. Admin: `https://seu-app.com/admin`
3. Upload de vídeo: Testar funcionalidade

### 3. Configurar Domínio Customizado (Opcional)
- Adicione DNS A/CNAME record
- Configure SSL gratuito (Let's Encrypt)

## 📊 Monitoramento

### Health Checks
```bash
# Via código (recomendado)
curl https://seu-app.com/api/health

# Via platform dashboard
# - Render: Monitor > Health
# - Railway: Metrics > Deployments  
# - Heroku: Resources > Dynos
```

### Logs
```bash
# Render
render logs videosplus-app

# Railway  
railway logs

# Heroku
heroku logs --tail -a videosplus-app
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### ❌ Build Failures
```bash
# Verificar dependências
npm install --production=false

# Logs detalhados
npm run build:typecheck
```

#### ❌ Wasabi Connection Errors
```bash
# Testar conectividade local
npm run setup-wasabi

# Verificar bucket permissions
aws s3 ls s3://seu-bucket-name --endpoint-url=https://s3.us-central-1.wasabisys.com
```

#### ❌ Environment Variables Missing
- Platform > Settings > Environment Variables
- Verificar sintaxe das variáveis
- Deploy após mudanças nas env vars

#### ❌ CORS Issues
- Configurar CORS no Wasabi bucket
- Verificar allowed origins no frontend
- Testar uploads cross-origin

## 📈 Performance Tips

### Otimizações Recomendadas
1. **CDN**: Cloudflare gratuito
2. **Images**: Compressão automática  
3. **Caching**: Browser cache headers
4. **Database**: Usar Wasabi como só storage

### Scaling Up
- Upgrade de plano quando necessário
- Load balancer para múltiplas instâncias
- Database separado se crescer muito

## 🔐 Segurança

### Checklist de Segurança
- [ ] HTTPS habilitado
- [ ] Variáveis de ambiente protegidas
- [ ] Permissões mínimo no Wasabi bucket
- [ ] Backup automático dos dados
- [ ] Rate limiting ativo (projeto tem)
- [ ] Autenticação segura

### Backup Strategy  
```bash
# Automatizado via plataforma
# Manual via Admin > Backup
# Dados sempre no Wasabi (resiliente)
```
