# 📱 Guia Completo: WhatsApp Bot para INOVAFOOD

Este guia ensina como instalar e configurar o WhatsApp Web.js no Docker para integrar com o painel INOVAFOOD.

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Instalação na VPS](#instalação-na-vps)
3. [Configuração do Docker](#configuração-do-docker)
4. [Conectando com INOVAFOOD](#conectando-com-inovafood)
5. [Testando a Integração](#testando-a-integração)
6. [Solução de Problemas](#solução-de-problemas)

---

## 🔧 Requisitos

- VPS com Ubuntu 20.04+ (mínimo 1GB RAM, 1 vCPU)
- Docker e Docker Compose instalados
- Acesso SSH à VPS
- Número de WhatsApp dedicado para o bot

---

## 🚀 Instalação na VPS

### 1. Conectar na VPS via SSH

```bash
ssh usuario@seu-ip-da-vps
```

### 2. Instalar Docker (se ainda não tiver)

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Criar estrutura de pastas

```bash
mkdir -p ~/whatsapp-bot
cd ~/whatsapp-bot
```

---

## 🐳 Configuração do Docker

### 1. Criar o arquivo `package.json`

```bash
cat > package.json << 'EOF'
{
  "name": "inovafood-whatsapp-bot",
  "version": "1.0.0",
  "description": "WhatsApp Bot para INOVAFOOD",
  "main": "src/index.ts",
  "scripts": {
    "start": "npx ts-node src/index.ts",
    "dev": "npx ts-node-dev --respawn src/index.ts"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.26.0",
    "qrcode-terminal": "^0.12.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "ts-node-dev": "^2.0.0",
    "@types/node": "^20.0.0"
  }
}
EOF
```

### 2. Criar o arquivo `tsconfig.json`

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

### 3. Criar o arquivo `src/index.ts`

```bash
mkdir -p src
cat > src/index.ts << 'EOF'
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import axios from 'axios';

// ⚠️ IMPORTANTE: Substitua pela URL do seu projeto Supabase
const WEBHOOK_URL = 'https://jfgsaenqxsupzbemhhds.supabase.co/functions/v1/whatsapp-proxy';

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './auth_info_baileys'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// Exibir QR Code para conectar
client.on('qr', (qr: string) => {
  console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
  console.log('');
  qrcode.generate(qr, { small: true });
  console.log('');
});

// Quando conectado
client.on('ready', () => {
  console.log('✅ WhatsApp Bot conectado com sucesso!');
  console.log('🤖 Bot INOVAFOOD está online e pronto para receber mensagens.');
});

// Quando autenticado
client.on('authenticated', () => {
  console.log('🔐 Autenticação realizada com sucesso!');
});

// Erro de autenticação
client.on('auth_failure', (msg: string) => {
  console.error('❌ Falha na autenticação:', msg);
});

// Quando desconectado
client.on('disconnected', (reason: string) => {
  console.log('🔌 Bot desconectado:', reason);
  console.log('🔄 Tentando reconectar em 5 segundos...');
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// Receber mensagens
client.on('message', async (message: Message) => {
  // Ignorar mensagens próprias e de grupos
  if (message.fromMe) return;
  if (message.from.includes('@g.us')) return;
  if (message.from === 'status@broadcast') return;

  const from = message.from.replace('@c.us', '');
  const text = message.body;

  console.log(`📩 Mensagem recebida de ${from}: ${text}`);

  try {
    // Enviar para o webhook do INOVAFOOD
    const response = await axios.post(WEBHOOK_URL, {
      action: 'webhook',
      from: from,
      text: text
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Se o webhook retornar uma resposta, enviar de volta
    if (response.data && response.data.reply) {
      await message.reply(response.data.reply);
      console.log(`📤 Resposta enviada para ${from}`);
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar mensagem:', error.message);
  }
});

// Função para enviar mensagem (usada pela API)
export async function sendMessage(phone: string, message: string): Promise<boolean> {
  try {
    // Formatar número
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    formattedPhone += '@c.us';

    await client.sendMessage(formattedPhone, message);
    console.log(`📤 Mensagem enviada para ${phone}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
    return false;
  }
}

// API HTTP simples para receber comandos de envio
import http from 'http';

const API_PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { phone, message } = JSON.parse(body);
        
        if (!phone || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'phone e message são obrigatórios' }));
          return;
        }

        const success = await sendMessage(phone, message);
        
        res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success, message: success ? 'Mensagem enviada' : 'Erro ao enviar' }));
      } catch (error: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/status') {
    const state = await client.getState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'online',
      whatsapp: state || 'disconnected'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
  }
});

server.listen(API_PORT, () => {
  console.log(`🌐 API HTTP rodando na porta ${API_PORT}`);
});

// Inicializar cliente
console.log('🚀 Iniciando WhatsApp Bot INOVAFOOD...');
client.initialize();
EOF
```

### 4. Criar o arquivo `Dockerfile`

```bash
cat > Dockerfile << 'EOF'
FROM node:18-slim

# Instalar dependências do Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar variáveis de ambiente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY src ./src

# Criar pasta para autenticação
RUN mkdir -p auth_info_baileys

# Expor porta da API
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "start"]
EOF
```

### 5. Criar o arquivo `docker-compose.yml`

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  whatsapp-bot:
    build: .
    container_name: inovafood-whatsapp
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./auth_info_baileys:/app/auth_info_baileys
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF
```

### 6. Criar pasta de autenticação

```bash
mkdir -p auth_info_baileys
chmod 777 auth_info_baileys
```

---

## ▶️ Executando o Bot

### Primeira execução (para escanear QR Code)

```bash
# Construir e iniciar
docker compose up --build

# O QR Code aparecerá no terminal
# Escaneie com seu WhatsApp (Configurações > Dispositivos Conectados)
```

### Execução em background (após conectar)

```bash
# Rodar em background
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar
docker compose down

# Reiniciar
docker compose restart
```

---

## 🔗 Conectando com INOVAFOOD

O bot já está configurado para:

1. **Receber mensagens** → Envia para o webhook do Supabase
2. **Responder automaticamente** → Com base no menu do bot
3. **Receber comandos de envio** → Via API HTTP na porta 3001

### API de Envio de Mensagens

O bot expõe uma API HTTP simples:

#### Enviar mensagem
```bash
curl -X POST http://SEU-IP-VPS:3001/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Olá! Seu pedido foi recebido."}'
```

#### Verificar status
```bash
curl http://SEU-IP-VPS:3001/status
```

---

## 🔥 Configuração do Firewall

```bash
# Liberar porta 3001 (API do bot)
sudo ufw allow 3001

# Verificar status
sudo ufw status
```

---

## 🛠️ Solução de Problemas

### QR Code não aparece
```bash
# Limpar sessão e reiniciar
rm -rf auth_info_baileys/*
docker compose down
docker compose up --build
```

### Bot desconecta frequentemente
```bash
# Verificar logs
docker compose logs -f

# Verificar recursos
docker stats inovafood-whatsapp
```

### Erro de memória
```bash
# Adicionar swap (se VPS tiver pouca RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📁 Estrutura Final

```
~/whatsapp-bot/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts
└── auth_info_baileys/
    └── (arquivos de sessão)
```

---

## ✅ Próximos Passos

Após configurar o bot, acesse o painel INOVAFOOD:

1. Vá em **Configurações > WhatsApp**
2. Configure a URL da API: `http://SEU-IP-VPS:3001`
3. Teste enviando uma mensagem

O bot agora irá:
- ✅ Responder mensagens automaticamente
- ✅ Enviar confirmação de pedidos
- ✅ Notificar status de entrega
