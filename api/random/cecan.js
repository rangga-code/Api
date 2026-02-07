const axios = require('axios');

module.exports = function(app) {
  async function cecanChina() {
    const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    if (!json.china || !Array.isArray(json.china)) {
      throw new Error('China category not found');
    }

    const url = json.china[Math.floor(Math.random() * json.china.length)];
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  app.get('/random/cecan', async (req, res) => {
    try {
      const img = await cecanChina();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};
