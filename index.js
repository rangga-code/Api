const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { Telegraf } = require('telegraf');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 5300;

const TELEGRAM_BOT_TOKEN = process.env.TG_TOKEN || '8018620744:AAFZ3ZcCohJQSM-4UvMz0_KPEqPLI5e_Msc';
const TELEGRAM_CHANNEL_ID = process.env.TG_CHAT || '@logreq1';
const ENABLE_TELEGRAM_LOG = true;
const OWNER_ID = '8077074486';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

async function sendToTelegram(text) {
  if (!ENABLE_TELEGRAM_LOG || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) return;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHANNEL_ID,
      text,
      disable_web_page_preview: true
    });
  } catch (err) {
    console.error(chalk.red('❌ Telegram Logger Error:'), err.response?.data || err.message);
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const oldSend = res.send;
  const oldJson = res.json;

  let responseBody = '';

  res.send = function (body) {
    responseBody = body;
    return oldSend.call(this, body);
  };

  res.json = function (data) {
    const finalData = {
      status: data?.status,
      creator: settings.apiSettings.creator || "Created Using Rynn UI",
      ...data
    };
    responseBody = JSON.stringify(finalData);
    return oldJson.call(this, finalData);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'Unknown';

    const logConsole = `${new Date().toISOString()} | ${ip} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`;

    if (res.statusCode < 400) console.log(chalk.green(logConsole));
    else if (res.statusCode < 500) console.log(chalk.yellow(logConsole));
    else console.log(chalk.red(logConsole));

    const telegramText =
`📊 API Request Log

🆔 IP: ${ip}
🌐 Method: ${req.method}
📍 Endpoint: ${req.originalUrl}
📡 Status: ${res.statusCode}
⚡ Duration: ${duration}ms
📱 UA: ${req.headers['user-agent'] || 'Unknown'}
📥 Body: ${JSON.stringify(req.body || {}, null, 2)}
📤 Response: ${typeof responseBody === 'string' ? responseBody.slice(0, 1000) : 'Empty'}

⏰ ${new Date().toLocaleString()}`;

    sendToTelegram(telegramText);
  });

  next();
});

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'Tidak ada username';
    const isOwner = userId.toString() === OWNER_ID;
    
    console.log(chalk.yellow(`🤖 User ${userId} (@${username}) start bot, Owner: ${isOwner}`));
    
    if (isOwner) {
        await ctx.reply(`Hallo @${username} 👋\n\nKamu adalah OWNER bot ini!\n\nFitur yang tersedia:\n/backup - Backup semua file project\n/listbackup - Lihat daftar backup\n/status - Cek status server`);
    } else {
        await ctx.reply(`Hallo @${username} jika kamu owner ketik /backup\njika bukan ngapain njir start start🗿`);
    }
});

bot.command('backup', async (ctx) => {
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || 'Tidak ada username';
    
    console.log(chalk.blue(`🔧 Backup command dari: ${userId} (@${username})`));
    
    if (userId !== OWNER_ID) {
        await ctx.reply('❌ Lu siapa? Cuma owner yang boleh backup njir! 🗿');
        console.log(chalk.red(`⛔ User ${userId} coba akses backup, ditolak!`));
        return;
    }
    
    try {
        await ctx.reply('🔄 Membuat backup, tunggu sebentar...');
        
        const backupFolder = path.join(__dirname, 'backup');
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${timestamp}.zip`;
        const backupPath = path.join(backupFolder, backupName);
        
        const output = fs.createWriteStream(backupPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        
        output.on('close', async () => {
            const fileSize = (archive.pointer() / 1024 / 1024).toFixed(2);
            
            console.log(chalk.green(`✅ Backup created: ${backupName} (${fileSize} MB)`));
            
            await ctx.reply(`✅ Backup berhasil dibuat!\n📁 Nama: ${backupName}\n💾 Size: ${fileSize} MB`);
            
            try {
                await ctx.replyWithDocument({
                    source: backupPath,
                    filename: backupName
                });
                
                console.log(chalk.green(`📤 Backup terkirim ke owner`));
                
                setTimeout(() => {
                    if (fs.existsSync(backupPath)) {
                        fs.unlinkSync(backupPath);
                        console.log(chalk.yellow(`🗑️ Cleaned up: ${backupName}`));
                    }
                }, 30000);
                
            } catch (uploadError) {
                console.error(chalk.red('❌ Upload error:'), uploadError);
                await ctx.reply('❌ Gagal mengirim file backup, file terlalu besar atau error.');
            }
        });
        
        archive.on('error', async (err) => {
            console.error(chalk.red('❌ Archive error:'), err);
            await ctx.reply('❌ Gagal membuat backup: ' + err.message);
        });
        
        archive.pipe(output);
        
        const filesToBackup = [
            'api-page',
            'src',
            'index.js',
            'package.json',
            'vercel.json'
        ];
        
        filesToBackup.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    archive.directory(filePath, file);
                } else {
                    archive.file(filePath, { name: file });
                }
            }
        });
        
        archive.finalize();
        
    } catch (error) {
        console.error(chalk.red('❌ Backup error:'), error);
        await ctx.reply('❌ Error saat membuat backup: ' + error.message);
    }
});

bot.command('listbackup', async (ctx) => {
    const userId = ctx.from.id.toString();
    
    if (userId !== OWNER_ID) {
        await ctx.reply('❌ Aku ga kenal lu, sob! 🗿');
        return;
    }
    
    const backupFolder = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupFolder)) {
        await ctx.reply('📭 Belum ada backup tersimpan.');
        return;
    }
    
    const backups = fs.readdirSync(backupFolder)
        .filter(file => file.endsWith('.zip'))
        .map(file => {
            const filePath = path.join(backupFolder, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                date: stats.birthtime.toLocaleString('id-ID')
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (backups.length === 0) {
        await ctx.reply('📭 Belum ada backup tersimpan.');
        return;
    }
    
    let message = '📦 Daftar Backup:\n\n';
    backups.forEach((backup, index) => {
        message += `${index + 1}. ${backup.name}\n   Size: ${backup.size} | Created: ${backup.date}\n\n`;
    });
    
    await ctx.reply(message);
});

bot.command('status', async (ctx) => {
    const userId = ctx.from.id.toString();
    
    if (userId !== OWNER_ID) {
        await ctx.reply('❌ Command ini khusus owner!');
        return;
    }
    
    const os = require('os');
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const statusMessage = 
`🤖 Log request bot

✅ Bot Aktif
👤 Owner: @${ctx.from.username}
🆔 User ID: ${userId}

📊 System Info:
• Platform: ${os.platform()} ${os.arch()}
• CPU: ${os.cpus()[0].model}
• RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB Total
• Free RAM: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB

⏰ Uptime: ${hours}h ${minutes}m ${seconds}s
📅 Server Time: ${new Date().toLocaleString('id-ID')}`;

    await ctx.reply(statusMessage);
});

bot.command('help', async (ctx) => {
    const userId = ctx.from.id.toString();
    
    if (userId === OWNER_ID) {
        await ctx.reply(
`🛠️ HELP MENU - OWNER

/start - Mulai bot
/backup - Backup semua file project
/listbackup - Lihat daftar backup
/status - Cek status server
/help - Menu bantuan ini

📝 Note: Backup akan otomatis terhapus 30 detik setelah dikirim.`
        );
    } else {
        await ctx.reply(
`ℹ️ HELP MENU

/start - Mulai bot
/help - Menu bantuan

© Nugget konts`
        );
    }
});

bot.catch((err, ctx) => {
    console.error(chalk.red(`❌ Bot Error: ${err}`));
    console.error(chalk.red(`📱 Update: ${JSON.stringify(ctx.update)}`));
});

let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');

fs.readdirSync(apiFolder).forEach(folder => {
  const folderPath = path.join(apiFolder, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    fs.readdirSync(folderPath).forEach(file => {
      if (file.endsWith('.js')) {
        require(path.join(folderPath, file))(app);
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${file} `));
      }
    });
  }
});

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server running on port ${PORT} `));
  
  bot.launch()
    .then(() => {
        console.log(chalk.bgGreen.black('🤖 Bot aktif ygy!'));
        console.log(chalk.cyan(`👑 Owner ID: ${OWNER_ID}`));
    })
    .catch(err => {
        console.error(chalk.red('❌ Gagal menjalankan bot:'), err);
    });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = app;