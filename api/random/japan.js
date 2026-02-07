const axios = require('axios');

module.exports = function(app) {
  async function cecanJapan() {
    const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    if (!json.japan || !Array.isArray(json.japan)) {
      throw new Error('Japan category not found');
    }

    const url = json.japan[Math.floor(Math.random() * json.japan.length)];
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  app.get('/random/japan', async (req, res) => {
    try {
      const img = await cecanJapan();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};