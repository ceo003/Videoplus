# 📦 Guia de Configuração do Wasabi para VideosPlus

## 🔑 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Configurações da aplicação
NODE_ENV=production
PORT=3000

# ============= CONFIGURAÇÕES DO WASABI (OBRIGATÓRIAS) =============
VITE_WASABI_ACCESS_KEY=sua_access_key_aqui
VITE_WASABI_SECRET_KEY=sua_secret_key_aqui
VITE_WASABI_REGION=us-central-1
VITE_WASABI_BUCKET=seu-nome-bucket
VITE_WASABI_ENDPOINT=https://s3.us-central-1.wasabisys.com

# ============= CONFIGURAÇÕES OPICONAIS =============
STRIPE_SECRET_KEY=sk_live_... # Para pagamentos
TELEGRAM_USERNAME=seu_usuario_telegram
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua_senha_app
```

## 📋 Como Ob-ter As Credenciais do Wasabi

### 1. Criar Conta no Wasabi
- Acesse: https://wasabi.com/
- Crie uma conta gratuita (primeiros 30 dias gratuitos)

### 2. Criar Bucket
- No painel do Wasabi, vá em "Storage Management"
- Clique em "Create Bucket"
- Escolha região: `us-central-1` (recomendado)
- Nome do bucket: escolha um nome único (ex: `videosplus-storage`)

### 3. Obter Credenciais de API
- Vá em "Access Management" 
- Clique em "Create Access Key"
- Nome: `VideosPlus API`
- Permissions: `Full Access`
- Salve o **Access Key ID** e **Secret Access Key**

### 4. Configurar Permissões do Bucket
O bucket deve ter:
- **Public Read**: Desabilitado (recomendado para segurança)
- **CORS**: Configurado para permitir uploads do seu domínio

## 🗂️ Estrutura de Pastas no Wasabi

Seu bucket deve ter esta estrutura:
```
seu-bucket/
├── videos/           # Arquivos de vídeo
├── thumbnails/       # Miniaturas dos vídeos  
└── metadata/         # Dados da aplicação (JSON)
    └── videosplus-data.json
```

## 🚀 Configuração para Produção

### Deploy Platforms Recomendados:
1. **Render.com** (gratuito)
2. **Railway.app** (gratuito) 
3. **Heroku** (pago)
4. **Vercel + Railway** (para frontend + backend)

### Arquivos de Deploy:
- ✅ `package.json` - configurações de scripts
- ✅ `render.yaml` - config para Render.com
- ✅ `vercel.json` - config para Vercel
- ✅ `server.js` - servidor backend

## 🔧 Testando a Configuração

Para testar se tudo funciona:

```bash
# Instalar dependências
npm install

# Iniciar servidor em desenvolvimento
npm run dev:all

# Ou iniciar apenas o servidor
npm run server
```

## 📊 Status da Aplicação

Acesse: `http://localhost:3000/api/health`

Para verificar conectividade com Wasabi:
- `http://localhost:3000/api/backup/status`

## 🎯 URLs Importantes

- **Admin**: `/admin` (email: admin@gmail.com, senha: admin123)
- **Login**: `/login` 
- **Vídeos**: `/videos`
- **Configurações**: Via painel admin

## ⚠️ Notas de Segurança

1. **Nunca** commite o arquivo `.env` no Git
2. Configure **CORS** no Wasabi para seu domínio de produção
3. Use **HTTPS** em produção
4. Mantenha suas chaves de API seguras
5. Considere usar políticas de IAM restritivas

## 🆘 Problemas Comuns

### Erro "403 Forbidden"
- Verifique se as chaves de API estão corretas
- Confirme se o bucket existe
- Verifique permissões na conta Wasabi

### Vídeos não carregam
- Verifique configuração de CORS
- Teste URLs assinadas via `/api/signed-url/`
- Confirme se arquivos estão no bucket correto

### Upload falha
- Verifique limite de tamanho de arquivo (atual: 50mb)
- Confirme se pasta existe no bucket
- Teste permissões de escrita
