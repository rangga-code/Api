const axios = require('axios');

module.exports = function(app) {
  async function cecanRandom() {
    const { data } = await axios.get('https://pastebin.com/raw/hxMBGiMv', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    // Gabung semua kategori jadi satu array
    const all = Object.values(json).flat();

    if (!all.length) throw new Error('No images found');

    const url = all[Math.floor(Math.random() * all.length)];
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  app.get('/random/cecanran', async (req, res) => {
    try {
      const img = await cecanRandom();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};