# ⚡ Instalação Rápida - WhatsApp Bot INOVAFOOD

Copie e cole os comandos abaixo na sua VPS:

## 1️⃣ Criar estrutura

```bash
mkdir -p ~/whatsapp-bot/src ~/whatsapp-bot/auth_info_baileys
cd ~/whatsapp-bot
chmod 777 auth_info_baileys
```

## 2️⃣ Baixar arquivos de configuração

```bash
# package.json
cat > package.json << 'ENDOFFILE'
{
  "name": "inovafood-whatsapp-bot",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "start": "npx ts-node src/index.ts"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.26.0",
    "qrcode-terminal": "^0.12.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "@types/node": "^20.0.0"
  }
}
ENDOFFILE

# tsconfig.json
cat > tsconfig.json << 'ENDOFFILE'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
ENDOFFILE

# Dockerfile
cat > Dockerfile << 'ENDOFFILE'
FROM node:18-slim
RUN apt-get update && apt-get install -y chromium fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 xdg-utils --no-install-recommends && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN mkdir -p auth_info_baileys
EXPOSE 3001
CMD ["npm", "start"]
ENDOFFILE

# docker-compose.yml
cat > docker-compose.yml << 'ENDOFFILE'
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
ENDOFFILE
```

## 3️⃣ Criar código do bot

```bash
cat > src/index.ts << 'ENDOFFILE'
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import http from 'http';

const WEBHOOK_URL = 'https://jfgsaenqxsupzbemhhds.supabase.co/functions/v1/whatsapp-proxy';
const API_PORT = 3001;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './auth_info_baileys' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  }
});

client.on('qr', (qr: string) => {
  console.log('📱 Escaneie o QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ WhatsApp Bot INOVAFOOD online!'));
client.on('authenticated', () => console.log('🔐 Autenticado!'));
client.on('auth_failure', (msg: string) => console.error('❌ Falha:', msg));
client.on('disconnected', (reason: string) => {
  console.log('🔌 Desconectado:', reason);
  setTimeout(() => client.initialize(), 5000);
});

client.on('message', async (message: Message) => {
  if (message.fromMe || message.from.includes('@g.us') || message.from === 'status@broadcast') return;
  
  const from = message.from.replace('@c.us', '');
  console.log(`📩 ${from}: ${message.body}`);

  try {
    const response = await axios.post(WEBHOOK_URL, {
      action: 'webhook',
      from,
      text: message.body
    }, { timeout: 30000 });

    if (response.data?.reply) {
      await message.reply(response.data.reply);
      console.log(`📤 Respondido para ${from}`);
    }
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
});

async function sendMessage(phone: string, message: string): Promise<boolean> {
  try {
    let formatted = phone.replace(/\D/g, '');
    if (!formatted.startsWith('55')) formatted = '55' + formatted;
    await client.sendMessage(formatted + '@c.us', message);
    console.log(`📤 Enviado para ${phone}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro envio:', error.message);
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { phone, message } = JSON.parse(body);
        if (!phone || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'phone e message obrigatórios' }));
          return;
        }
        const success = await sendMessage(phone, message);
        res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success }));
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/status') {
    const state = await client.getState().catch(() => 'disconnected');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'online', whatsapp: state }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(API_PORT, () => console.log(`🌐 API na porta ${API_PORT}`));
console.log('🚀 Iniciando bot...');
client.initialize();
ENDOFFILE
```

## 4️⃣ Iniciar bot

```bash
# Primeira vez (para escanear QR)
docker compose up --build

# Após conectar, rodar em background
docker compose up -d --build

# Ver logs
docker compose logs -f
```

## 5️⃣ Testar

```bash
# Verificar status
curl http://localhost:3001/status

# Enviar mensagem teste
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Teste do bot!"}'
```

## 🔥 Liberar firewall

```bash
sudo ufw allow 3001
```

---

✅ **Pronto!** O bot está funcionando.

Configure a URL `http://SEU-IP:3001` no painel INOVAFOOD.
