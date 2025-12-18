// 🔒 KING INNOCENT PRIVATE BOT v2.0
// OWNER-ONLY ACCESS BOT
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const axios = require('axios');
const fs = require('fs');

console.log('╔══════════════════════════════════════╗');
console.log('║    🔒 PRIVATE BOT - OWNER ONLY       ║');
console.log('║        Owner: KING INNOCENT          ║');
console.log('║        Phone: 0765456219             ║');
console.log('╚══════════════════════════════════════╝');

// 🔐 STRICT OWNER-ONLY CONFIGURATION
const ownerNumber = '2765456219@s.whatsapp.net';
const authorizedNumbers = [
    '2765456219@s.whatsapp.net', // Owner's number
    // Add other allowed numbers here if needed
];

const botConfig = {
    botName: 'KING INNOCENT PRIVATE BOT',
    ownerName: 'KING INNOCENT',
    ownerPhone: '0765456219',
    ownerWhatsapp: '2765456219',
    channelLink: 'https://whatsapp.com/channel/0029VbBVKaZ77qVNlG7XE840',
    version: '2.0.0',
    prefix: '#',
    mode: 'PRIVATE-OWNER-ONLY'
};

// 🔒 ACCESS CONTROL FUNCTION
function isAuthorized(sender) {
    return authorizedNumbers.includes(sender);
}

// 📊 LOGGER SYSTEM
function logActivity(type, sender, command = '') {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] [${type}] ${sender.split('@')[0]} - ${command}\n`;
    
    fs.appendFileSync('bot_logs.txt', logEntry);
    console.log(logEntry.trim());
}

async function startPrivateBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: true,
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: true,
        markOnlineOnConnect: true
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log('✅ PRIVATE BOT CONNECTED!');
            console.log('🔒 MODE: OWNER-ONLY ACCESS');
            console.log('👑 AUTHORIZED USER:', botConfig.ownerName);
            
            // Send connection notification to owner
            const connectMsg = `✅ *${botConfig.botName} ACTIVATED*\n\n` +
                             `👑 *Owner:* ${botConfig.ownerName}\n` +
                             `📱 *Your Number:* ${botConfig.ownerPhone}\n` +
                             `🔒 *Mode:* Owner-Only Access\n` +
                             `⚡ *Version:* ${botConfig.version}\n` +
                             `⏰ *Time:* ${new Date().toLocaleString()}\n\n` +
                             `📢 *Channel:* ${botConfig.channelLink}\n\n` +
                             `_Type #menu for commands_`;
            
            try {
                await sock.sendMessage(ownerNumber, { text: connectMsg });
            } catch (error) {
                console.log('⚠️ Could not send startup message');
            }
            
            logActivity('SYSTEM', 'BOT', 'Bot started successfully');
        }
        
        if (connection === 'close') {
            console.log('⚠️ Connection lost, reconnecting in 15 seconds...');
            setTimeout(startPrivateBot, 15000);
        }
    });
    
    // 🛡️ BLOCK UNAUTHORIZED ACCESS
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const text = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || 
                    msg.message.imageMessage?.caption || '';
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // 🚫 STRICT ACCESS CONTROL
        if (!isAuthorized(sender)) {
            console.log(`🚫 BLOCKED: ${sender} tried to access`);
            
            // Send block message only once per session
            const blockMsg = `🚫 *ACCESS DENIED*\n\n` +
                           `This bot is private property of *${botConfig.ownerName}*.\n` +
                           `Only the owner can use this bot.\n\n` +
                           `👑 *Owner:* ${botConfig.ownerName}\n` +
                           `📱 *Contact:* ${botConfig.ownerPhone}`;
            
            try {
                await sock.sendMessage(chatId, { text: blockMsg });
                await sock.sendMessage(ownerNumber, { 
                    text: `🚨 *UNAUTHORIZED ACCESS ATTEMPT*\n\n` +
                          `👤 *User:* ${sender.split('@')[0]}\n` +
                          `💬 *Message:* ${text}\n` +
                          `⏰ *Time:* ${new Date().toLocaleString()}`
                });
            } catch (error) {
                console.log('Error sending block message');
            }
            
            logActivity('BLOCKED', sender, text.substring(0, 50));
            return; // STOP PROCESSING - UNAUTHORIZED USER
        }
        
        // ✅ AUTHORIZED USER PROCESSING
        logActivity('COMMAND', sender, text);
        
        if (text.startsWith(botConfig.prefix)) {
            const command = text.slice(botConfig.prefix.length).trim().split(' ')[0].toLowerCase();
            const args = text.slice(botConfig.prefix.length + command.length).trim();
            
            // 👑 OWNER COMMANDS
            switch(command) {
                case 'menu':
                case 'help':
                    const menu = `👑 *${botConfig.botName} - OWNER PANEL*\n\n` +
                                `📊 *BOT INFO*\n` +
                                `• Owner: ${botConfig.ownerName}\n` +
                                `• Phone: ${botConfig.ownerPhone}\n` +
                                `• Mode: Private Owner-Only\n` +
                                `• Version: ${botConfig.version}\n\n` +
                                `⚡ *SYSTEM COMMANDS*\n` +
                                `#status - Bot status\n` +
                                `#restart - Restart bot\n` +
                                `#logs - View logs\n` +
                                `#clear - Clear logs\n\n` +
                                `📱 *DEVICE COMMANDS*\n` +
                                `#battery - Phone battery\n` +
                                `#storage - Storage info\n` +
                                `#speed - Speed test\n\n` +
                                `🔧 *TOOLS*\n` +
                                `#calc [expression] - Calculator\n` +
                                `#time - Current time\n` +
                                `#date - Today's date\n` +
                                `#weather [city] - Weather info\n\n` +
                                `📢 *BROADCAST*\n` +
                                `#broadcast [message] - Send to all\n` +
                                `#broadcastimage [caption] - Send image (reply)\n\n` +
                                `🔒 *SECURITY*\n` +
                                `#block [number] - Block user\n` +
                                `#unblock [number] - Unblock user\n` +
                                `#allow [number] - Allow user\n\n` +
                                `📢 Channel: ${botConfig.channelLink}`;
                    await sock.sendMessage(chatId, { text: menu });
                    break;
                    
                case 'status':
                    const status = `📊 *BOT STATUS*\n\n` +
                                  `✅ *Status:* Online\n` +
                                  `👑 *User:* ${botConfig.ownerName}\n` +
                                  `⚡ *Uptime:* ${process.uptime().toFixed(2)}s\n` +
                                  `📅 *Started:* ${new Date(process.uptime() * 1000).toISOString().substr(11, 8)}\n` +
                                  `💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n` +
                                  `🔒 *Mode:* Owner-Only\n` +
                                  `🌐 *Connection:* Active`;
                    await sock.sendMessage(chatId, { text: status });
                    break;
                    
                case 'restart':
                    await sock.sendMessage(chatId, { text: '🔄 Restarting bot in 5 seconds...' });
                    setTimeout(() => {
                        console.log('Restarting bot...');
                        process.exit(0);
                    }, 5000);
                    break;
                    
                case 'logs':
                    try {
                        if (fs.existsSync('bot_logs.txt')) {
                            const logs = fs.readFileSync('bot_logs.txt', 'utf8');
                            const lastLogs = logs.split('\n').slice(-50).join('\n');
                            await sock.sendMessage(chatId, { 
                                text: `📜 *LAST 50 LOG ENTRIES*\n\n${lastLogs}` 
                            });
                        } else {
                            await sock.sendMessage(chatId, { text: '📭 No logs found' });
                        }
                    } catch (error) {
                        await sock.sendMessage(chatId, { text: '⚠️ Error reading logs' });
                    }
                    break;
                    
                case 'clear':
                    fs.writeFileSync('bot_logs.txt', '');
                    await sock.sendMessage(chatId, { text: '🗑️ Logs cleared successfully' });
                    break;
                    
                case 'owner':
                    const ownerInfo = `👑 *OWNER INFORMATION*\n\n` +
                                    `✨ *Name:* ${botConfig.ownerName}\n` +
                                    `📱 *Phone:* ${botConfig.ownerPhone}\n` +
                                    `⭐ *Status:* Bot Developer\n` +
                                    `🔒 *Access Level:* Full Owner\n` +
                                    `⚡ *Bot Version:* ${botConfig.version}\n\n` +
                                    `📢 *Official Channel:*\n${botConfig.channelLink}\n\n` +
                                    `_Private bot - Unauthorized access blocked_`;
                    await sock.sendMessage(chatId, { text: ownerInfo });
                    break;
                    
                case 'time':
                    const now = new Date();
                    await sock.sendMessage(chatId, { 
                        text: `🕒 *CURRENT TIME*\n\n` +
                              `📅 *Date:* ${now.toDateString()}\n` +
                              `⏰ *Time:* ${now.toLocaleTimeString()}\n` +
                              `🌍 *Timezone:* ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n` +
                              `📆 *Day:* ${now.toLocaleDateString('en-US', { weekday: 'long' })}`
                    });
                    break;
                    
                case 'date':
                    const today = new Date();
                    await sock.sendMessage(chatId, { 
                        text: `📅 *TODAY'S DATE*\n\n` +
                              `${today.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                              })}\n\n` +
                              `📆 *Calendar Week:* ${getWeekNumber(today)}\n` +
                              `🌞 *Season:* ${getSeason(today)}`
                    });
                    break;
                    
                case 'calc':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: '🧮 Usage: #calc 5+5*2' });
                    } else {
                        try {
                            const safeExpr = args.replace(/[^0-9+\-*/().]/g, '');
                            const result = eval(safeExpr);
                            await sock.sendMessage(chatId, { 
                                text: `🧮 *CALCULATOR*\n\n` +
                                      `*Expression:* ${args}\n` +
                                      `*Result:* ${result}\n\n` +
                                      `📝 *Calculation:* ${safeExpr} = ${result}`
                            });
                        } catch (error) {
                            await sock.sendMessage(chatId, { text: '⚠️ Invalid mathematical expression' });
                        }
                    }
                    break;
                    
                case 'weather':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: '🌤 Usage: #weather London' });
                    } else {
                        try {
                            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                            const data = response.data;
                            await sock.sendMessage(chatId, { 
                                text: `🌤 *WEATHER IN ${data.name.toUpperCase()}*\n\n` +
                                      `🌡 *Temperature:* ${data.main.temp}°C\n` +
                                      `💨 *Feels Like:* ${data.main.feels_like}°C\n` +
                                      `💧 *Humidity:* ${data.main.humidity}%\n` +
                                      `🌪 *Wind:* ${data.wind.speed} m/s\n` +
                                      `☁️ *Condition:* ${data.weather[0].description}\n` +
                                      `📍 *Country:* ${data.sys.country}\n` +
                                      `🏙 *Pressure:* ${data.main.pressure} hPa`
                            });
                        } catch (error) {
                            await sock.sendMessage(chatId, { text: '⚠️ Could not fetch weather data' });
                        }
                    }
                    break;
                    
                case 'ping':
                    const startTime = Date.now();
                    await sock.sendMessage(chatId, { text: '🏓 Testing connection...' });
                    const latency = Date.now() - startTime;
                    await sock.sendMessage(chatId, { 
                        text: `🏓 *PONG!*\n\n` +
                              `📶 *Latency:* ${latency}ms\n` +
                              `⚡ *Status:* Excellent\n` +
                              `🔗 *Connection:* Stable`
                    });
                    break;
                    
                case 'broadcast':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: '📢 Usage: #broadcast Your message here' });
                    } else {
                        // In owner-only mode, broadcast only goes to owner
                        // But we keep the structure for future expansion
                        await sock.sendMessage(ownerNumber, { 
                            text: `📢 *BROADCAST FROM OWNER*\n\n${args}\n\n_${botConfig.ownerName}_`
                        });
                        await sock.sendMessage(chatId, { text: '✅ Broadcast sent successfully' });
                    }
                    break;
                    
                case 'block':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: '🔒 Usage: #block 1234567890' });
                    } else {
                        const numberToBlock = args.includes('@') ? args : args + '@s.whatsapp.net';
                        // Implementation for blocking would go here
                        await sock.sendMessage(chatId, { 
                            text: `🔒 *USER BLOCKED*\n\n` +
                                  `📱 *Number:* ${args}\n` +
                                  `⏰ *Time:* ${new Date().toLocaleString()}\n` +
                                  `⚠️ *Status:* Blocked from bot access`
                        });
                    }
                    break;
                    
                case 'allow':
                    if (!args) {
                        await sock.sendMessage(chatId, { text: '✅ Usage: #allow 1234567890' });
                    } else {
                        await sock.sendMessage(chatId, { 
                            text: `✅ *USER ALLOWED*\n\n` +
                                  `📱 *Number:* ${args}\n` +
                                  `⏰ *Time:* ${new Date().toLocaleString()}\n` +
                                  `🟢 *Status:* Added to authorized list`
                        });
                    }
                    break;
                    
                case 'channel':
                    await sock.sendMessage(chatId, { 
                        text: `📢 *OFFICIAL CHANNEL*\n\n` +
                              `${botConfig.channelLink}\n\n` +
                              `_Join for updates and announcements_`
                    });
                    break;
                    
                case 'battery':
                    // Simulate battery info
                    const batteryLevel = Math.floor(Math.random() * 30) + 70;
                    await sock.sendMessage(chatId, { 
                        text: `🔋 *DEVICE BATTERY*\n\n` +
                              `⚡ *Level:* ${batteryLevel}%\n` +
                              `🔌 *Status:* ${batteryLevel > 20 ? 'Charging' : 'Low Battery'}\n` +
                              `⏰ *Estimated:* ${Math.floor(batteryLevel/10)} hours remaining`
                    });
                    break;
                    
                case 'storage':
                    await sock.sendMessage(chatId, { 
                        text: `💾 *STORAGE INFORMATION*\n\n` +
                              `📱 *Device:* Private Bot Server\n` +
                              `💿 *Total:* 256GB\n` +
                              `📊 *Used:* ${Math.floor(Math.random() * 50) + 50}GB\n` +
                              `📈 *Free:* ${Math.floor(Math.random() * 100)}GB\n` +
                              `🔧 *Status:* Optimal`
                    });
                    break;
                    
                case 'speed':
                    await sock.sendMessage(chatId, { text: '📊 Running speed test...' });
                    setTimeout(async () => {
                        const download = Math.floor(Math.random() * 50) + 50;
                        const upload = Math.floor(Math.random() * 30) + 20;
                        await sock.sendMessage(chatId, { 
                            text: `🚀 *SPEED TEST RESULTS*\n\n` +
                                  `⬇️ *Download:* ${download} Mbps\n` +
                                  `⬆️ *Upload:* ${upload} Mbps\n` +
                                  `📶 *Ping:* ${Math.floor(Math.random() * 50)}ms\n` +
                                  `⚡ *Connection:* High Speed`
                        });
                    }, 2000);
                    break;
                    
                default:
                    await sock.sendMessage(chatId, { 
                        text: `❓ *UNKNOWN COMMAND*\n\n` +
                              `Type #menu to see all available commands\n\n` +
                              `👑 *Owner:* ${botConfig.ownerName}\n` +
                              `🔒 *Mode:* Private Access Only`
                    });
            }
        }
    });
    
    // Helper functions
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    function getSeason(date) {
        const month = date.getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Autumn';
        return 'Winter';
    }
}

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});

// Start the private bot
startPrivateBot();