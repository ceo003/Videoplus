# ⚡ Quick Start - VideosPlus com Wasabi

## 🚀 Deploy Rápido (5 minutos)

### Passo 1: Preparar Credenciais 🏗️

#### Criar Bucket Wasabi:
1. Acesse: https://wasabi.com/
2. Criar conta gratuita
3. **Storage Management** > **Create Bucket**
   - Nome: `videosplus-staging` 
   - Região: `us-central-1`
4. **Access Management** > **Create Access Key**
   - Nome: `VideosPlus Production`
   - Permissions: `Full Access`

#### Criar arquivo `.env`:
```bash
# Copie para a raiz do projeto
VITE_WASABI_ACCESS_KEY=WKAI8SDQ2ZFVQONABGZJ
VITE_WASABI_SECRET_KEY=Xg8E+qj2f+kO9KQ2O8Xm3qkS2mB8qZ9VqL9OzA+bJj  
VITE_WASABI_REGION=us-central-1
VITE_WASABI_BUCKET=videosplus-staging
VITE_WASABI_ENDPOINT=https://s3.us-central-1.wasabisys.com
NODE_ENV=production
```

### Passo 2: Configurar Projeto ⚙️

#### Terminal/Command Prompt:
```bash
# Instalar dependências
npm install

# Testar configuração Wasabi
npm run setup-wasabi

# Se tudo OK, inicie o projeto
npm run dev:all
```

#### Verificar se funcionou:
- Backend: http://localhost:3000/api/health
- Admin: http://localhost:3000/admin  
- Login: admin@gmail.com / admin123

### Passo 3: Deploy Produção 🚀

#### Para Render.com (Super Rápido):
1. Conecte GitHub: https://render.com/
2. **New** > **Web Service**
3. Selecione seu repositório
4. Configurações:
   ```
   Name: videosplus-app
   Environment: Node
   Build Command: npm install  
   Start Command: npm run start
   ```
5. **Environment Variables** > Adicione todas as variables do `.env`
6. **Create Web Service**

✅ **Feito!** Sua app estará online em ~5 minutos!

#### Para Railway.app (Alternativa):
1. Conecte GitHub: https://railway.app/
2. **New Project** > **Deploy from GitHub Repo**
3. Adicione todas as environment variables
4. **Deploy Now**

## 🎯 URLs Importantes

| Função | URL |
|--------|-----|
| **Admin Login** | `/admin` |
| **Video List** | `/videos` |  
| **Health Check** | `/api/health` |
| **Status Wasabi** | `/api/backup/status` |

## 👤 Credenciais Padrão

```
Email: admin@gmail.com
Senha: admin123
```

## 🔧 Passos Opcionais

### Configurar CORS no Wasabi:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### Configurar Pagamentos (Stripe/PayPal):
1. Acesse `/admin` 
2. Vá em **Configurações**
3. Adicione suas chaves API

### Customizar Site:
1. **Configurações** > **Site**
2. Mude nome, cores, textos
3. Adicione logo e favicon

## 🆘 Resolução Rápida

### ❌ "Bucket não encontrado"
→ Verifique nome do bucket no `.env`

### ❌ "Conexão falhou"  
→ Teste: `npm run setup-wasabi`

### ❌ "403 Forbidden"
→ Verifique Access Key e Secret Key

### ❌ "Build falhou no deploy"
→ Teste local: `npm run build`

### ❌ "Admin não carrega"
→ Limpe cache do navegador

## 📱 Mobile Ready 

✅ **Responsivo**: Funciona em celular
✅ **PWA**: Instalável como app
✅ **Fast**: Otimizado para velocidade

## 🔒 Segurança

✅ **HTTPS**: Automático em produção  
✅ **CORS**: Configurado
✅ **Authentication**: Sistema próprio
✅ **Rate Limiting**: Proteção DDoS

## 📊 Fatures Incluídas

- 🎥 **Upload de Vídeos**
- 🖼️ **Thumbnails automáticas**
- 💳 **Pagamentos via Stripe/PayPal**
- 📧 **Notificações por email**
- 📱 **Integração Telegram**
- 🔍 **Analytics integrado**
- 🛡️ **Backup automático**
- ⚡ **CDN integrado via Wasabi**
