// 🔒 KING INNOCENT PRIVATE BOT - WORKING QR FIX
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const axios = require('axios');
const fs = require('fs');

console.log('╔══════════════════════════════════════╗');
console.log('║    🔒 KING INNOCENT PRIVATE BOT      ║');
console.log('║        OWNER-ONLY ACCESS             ║');
console.log('╚══════════════════════════════════════╝');

const OWNER_NUMBER = '2765456219@s.whatsapp.net';
const AUTHORIZED_NUMBERS = ['2765456219@s.whatsapp.net'];

const CONFIG = {
    botName: 'KING INNOCENT PRIVATE BOT',
    ownerName: 'KING INNOCENT',
    phone: '0765456219',
    channel: 'https://whatsapp.com/channel/0029VbBVKaZ77qVNlG7XE840',
    version: '2.0.0',
    prefix: '#'
};

function logActivity(type, sender, command = '') {
    const time = new Date().toLocaleString();
    const log = `[${time}] [${type}] ${sender.split('@')[0]} - ${command}\n`;
    fs.appendFileSync('bot.log', log);
    console.log(log.trim());
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        auth: state,
        version,
        browser: Browsers.ubuntu('Chrome')
    });
    
    // 🔥 QR CODE FIXED HERE
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr) {
            console.log('\n📱 SCAN THIS QR CODE WITH WHATSAPP (0765456219):\n');
            console.log(qr);
            console.log('\n⏰ Scan within 30 seconds...\n');
        }
        
        if (connection === 'open') {
            console.log('✅ BOT CONNECTED! Owner: KING INNOCENT');
            const msg = `✅ *${CONFIG.botName} ACTIVATED*\n\n👑 Owner: ${CONFIG.ownerName}\n📱 Phone: ${CONFIG.phone}`;
            sock.sendMessage(OWNER_NUMBER, { text: msg }).catch(() => {});
            logActivity('SYSTEM', 'BOT', 'Bot started');
        }
        
        if (connection === 'close') {
            console.log('⚠️ Connection closed, reconnecting...');
            setTimeout(startBot, 10000);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        if (!AUTHORIZED_NUMBERS.includes(sender)) {
            console.log(`🚫 BLOCKED: ${sender}`);
            sock.sendMessage(chatId, { 
                text: `🚫 ACCESS DENIED\nThis is private bot of ${CONFIG.ownerName}`
            }).catch(() => {});
            sock.sendMessage(OWNER_NUMBER, { 
                text: `🚨 UNAUTHORIZED\n👤 ${sender}\n💬 ${text.substring(0, 50)}`
            }).catch(() => {});
            return;
        }
        
        if (text.startsWith(CONFIG.prefix)) {
            const cmd = text.slice(CONFIG.prefix.length).trim().split(' ')[0].toLowerCase();
            const args = text.slice(CONFIG.prefix.length + cmd.length).trim();
            
            logActivity('COMMAND', sender, cmd);
            
            switch(cmd) {
                case 'menu':
                    const menu = `👑 *${CONFIG.botName}*\n\n📱 Owner: ${CONFIG.ownerName}\n🔢 Phone: ${CONFIG.phone}\n\n⚡ Commands:\n#menu - This menu\n#owner - Owner info\n#ping - Test bot\n#time - Current time\n#calc 5+5 - Calculator\n#weather London - Weather\n#logs - View logs\n#channel - Our channel`;
                    await sock.sendMessage(chatId, { text: menu });
                    break;
                    
                case 'owner':
                    await sock.sendMessage(chatId, { 
                        text: `👑 OWNER\n✨ ${CONFIG.ownerName}\n📱 ${CONFIG.phone}\n📢 ${CONFIG.channel}`
                    });
                    break;
                    
                case 'ping':
                    await sock.sendMessage(chatId, { text: '🏓 Pong! From KING INNOCENT' });
                    break;
                    
                case 'time':
                    const now = new Date();
                    await sock.sendMessage(chatId, { 
                        text: `🕒 ${now.toDateString()}\n⏰ ${now.toLocaleTimeString()}`
                    });
                    break;
                    
                case 'calc':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: 'Usage: #calc 5+5*2' });
                    } else {
                        try {
                            const result = eval(args.replace(/[^0-9+\-*/().]/g, ''));
                            await sock.sendMessage(chatId, { text: `🧮 ${args} = ${result}` });
                        } catch {
                            await sock.sendMessage(chatId, { text: '⚠️ Invalid math' });
                        }
                    }
                    break;
                    
                case 'weather':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: 'Usage: #weather London' });
                    } else {
                        try {
                            const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                            const data = res.data;
                            await sock.sendMessage(chatId, { 
                                text: `🌤 ${data.name}\n🌡 ${data.main.temp}°C\n💧 ${data.main.humidity}%\n💨 ${data.wind.speed} m/s`
                            });
                        } catch {
                            await sock.sendMessage(chatId, { text: '⚠️ Weather error' });
                        }
                    }
                    break;
                    
                case 'logs':
                    if (fs.existsSync('bot.log')) {
                        const logs = fs.readFileSync('bot.log', 'utf8');
                        const lastLogs = logs.split('\n').slice(-10).join('\n');
                        await sock.sendMessage(chatId, { text: `📜 Logs:\n${lastLogs}` });
                    } else {
                        await sock.sendMessage(chatId, { text: '📭 No logs' });
                    }
                    break;
                    
                case 'channel':
                    await sock.sendMessage(chatId, { text: `📢 ${CONFIG.channel}` });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, { text: '❓ Unknown command. Use #menu' });
            }
        }
    });
}

startBot();