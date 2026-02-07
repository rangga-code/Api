const axios = require('axios');

module.exports = function(app) {
  async function cecanKorea() {
    const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    if (!json.korea || !Array.isArray(json.korea)) {
      throw new Error('Korea category not found');
    }

    const url = json.korea[Math.floor(Math.random() * json.korea.length)];
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  app.get('/random/korea', async (req, res) => {
    try {
      const img = await cecanKorea();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};
