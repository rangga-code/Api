const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const FormData = require('form-data');
const mime = require('mime-types');

async function uploadToIkkyzx(fileBuffer, fileName) {
  const form = new FormData();
  const mimeType = mime.lookup(fileName) || "application/octet-stream";

  form.append('file', fileBuffer, {
    filename: fileName,
    contentType: mimeType
  });

  const res = await axios.post('https://ikyyzx-uploader.lol/upload', form, {
    headers: { ...form.getHeaders(), Accept: 'application/json' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  if (!res.data?.success || !res.data?.url) throw new Error("Upload gagal");
  return res.data.url;
}

async function createNglImage(username, message) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  try {
    const logo = await loadImage('https://ikyyzx-uploader.lol/P4cY.jpg');
    ctx.drawImage(logo, width - 120, 20, 100, 100);
  } catch (e) {}

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Sans';
  ctx.fillText(`@${username}`, 50, 80);

  ctx.fillStyle = '#fff';
  ctx.font = '30px Sans';
  const lines = message.match(/.{1,40}/g) || [message];
  lines.forEach((line, i) => {
    ctx.fillText(line, 50, 150 + i * 40);
  });

  return canvas.toBuffer('image/png');
}

function extractUsername(input) {
  if (!input) return null;
  input = input.trim();
  if (input.startsWith('https://ngl.link/')) {
    return input.split('/').pop();
  }
  if (input.startsWith('@')) return input.slice(1);
  return input;
}

module.exports = function(app) {
  app.get('/tools/nglspam', async (req, res) => {
    const { apikey, target, message, count = 19 } = req.query;
    
    if (!apikey || apikey.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'apikey' wajib diisi."
      });
    }
    
    if (apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        creator: "ibnu", 
        message: "API key tidak valid."
      });
    }

    try {
      let spamCount = parseInt(count);
      if (spamCount > 20) spamCount = 20;

      const username = extractUsername(target);

      if (!username || !message) {
        return res.status(400).json({
          status: false,
          creator: "ibnu",
          message: 'Parameter target (username/link) & message wajib diisi.'
        });
      }

      for (let i = 0; i < spamCount; i++) {
        await axios.post('https://ngl.link/api/submit', {
          username,
          question: message,
          deviceId: Math.random().toString(36).substring(2)
        });
      }

      const imgBuffer = await createNglImage(username, message);
      const thumbUrl = await uploadToIkkyzx(imgBuffer, `ngl_${username}.png`);

      res.json({
        status: true,
        creator: "ibnu",
        data: {
          target,
          username,
          message,
          total_sent: spamCount,
          thumbnail: thumbUrl
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[NGL SPAM]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan spam NGL"
      });
    }
  });
};