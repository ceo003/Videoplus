
# 📖 Guia Completo de Configuração: Wasabi + Render

Este arquivo documenta todos os passos realizados para configurar o armazenamento no Wasabi e sincronizar com o deploy no Render.

---

## 🔧 1. Configuração do Wasabi

### 1.1 Criar Conta e Bucket
1. Acesse o [painel do Wasabi](https://console.wasabisys.com/)
2. Crie uma conta (gratuita nos primeiros 30 dias)
3. Vá em **Storage Management** → **Create Bucket**
4. Nome do bucket: `videoplus2` (ou o seu nome preferido, único)
5. Escolha a região: `us-central-1` (recomendado)
6. Clique em **Create Bucket**

### 1.2 Obter Credenciais de API (Chaves de Acesso)
1. No menu lateral, clique em **Access Management** → **Access Keys**
2. Clique em **Create Access Key**
3. Nomeie a chave (ex: `VideosPlus-API`)
4. Selecione permissões: `Full Access`
5. **Guarde os valores gerados**:
   - `Access Key ID`
   - `Secret Access Key`

### 1.3 Configurar CORS (Importante para Uploads)
O CORS permite que o navegador do usuário faça uploads diretamente para o bucket sem bloqueios.
1. Vá até o seu bucket (`videoplus2`)
2. Clique na aba **Settings**
3. Role até **CORS Configuration**
4. Cole o seguinte JSON:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["linksdodeploy"],
    "ExposeHeaders": ["ETag"]
  }
]
```
5. Clique em **Save**

---

## 🚀 2. Configuração do Render

### 2.1 Adicionar Variáveis de Ambiente
1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Selecione o seu Web Service (ex: `videosplus`)
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis abaixo (copie os valores do seu Wasabi):

| Chave | Valor |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `VITE_API_URL` | `https://videoplus.onrender.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `""` (se não usar Stripe) |
| `VITE_WASABI_ACCESS_KEY` | Sua Access Key do Wasabi |
| `VITE_WASABI_BUCKET` | `videoplus2` |
| `VITE_WASABI_ENDPOINT` | `https://s3.us-central-1.wasabisys.com` |
| `VITE_WASABI_REGION` | `us-central-1` |
| `VITE_WASABI_SECRET_KEY` | Sua Secret Key do Wasabi |

5. Clique em **Save Changes**

### 2.2 Deploy Automático
Após salvar as variáveis, o Render fará um deploy automático. Aguarde o status ficar **Live**.

---

## 🔐 3. Credenciais de Acesso Administrativo

Para entrar no painel de admin e postar vídeos:
- **URL**: `https://videoplus.onrender.com/admin`
- **Email**: `admin@gmail.com`
- **Senha**: `admin123`

---

## ✅ 4. Verificação do Funcionamento

1. Acesse a URL do seu app no Render
2. Entre no painel admin
3. Tente postar um vídeo curto e uma miniatura
4. Verifique no Wasabi se os arquivos foram salvos nas pastas:
   - `videos/`
   - `thumbnails/`
   - `metadata/videosplus-data.json`

O sistema cria automaticamente essas pastas se elas não existirem.

---

## 📂 5. Estrutura do Bucket do Wasabi

```
videoplus2/
├── videos/               # Arquivos de vídeo (MP4, etc.)
├── thumbnails/           # Miniaturas dos vídeos (JPG, PNG)
└── metadata/
    └── videosplus-data.json  # Dados da aplicação (vídeos, usuários, configs)
```

---

## 🚨 6. Problemas Comuns e Soluções

### Erro de Upload (CORS)
- Verifique se a configuração de CORS no Wasabi está correta
- Certifique-se de que `AllowedOrigins` inclui o seu domínio do Render

### Vídeos Não Carregam
- Confira se as chaves de acesso estão corretas (sem espaços em branco)
- Verifique se o bucket existe e se tem permissões de escrita

### Erro 500
- Acesse `https://videoplus.onrender.com/api/health` para verificar o status do servidor
- Veja os logs no Render para detalhes do erro

---

## 📝 7. Arquivos do Projeto Relacionados

- [server/services/WasabiBackendService.js](file:///c:/Projectos/MarketingHot/server/services/WasabiBackendService.js): Serviço de comunicação com o Wasabi
- [api-routes.js](file:///c:/Projectos/MarketingHot/api-routes.js): Rotas de API para upload e gerenciamento
- [render.yaml](file:///c:/Projectos/MarketingHot/render.yaml): Configuração base do Render
- [wasabi-config-guide.md](file:///c:/Projectos/MarketingHot/wasabi-config-guide.md): Guia adicional do Wasabi
