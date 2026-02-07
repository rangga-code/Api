const axios = require('axios');

module.exports = function(app) {
  async function cecanIndonesia() {
    const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    if (!json.indonesia || !Array.isArray(json.indonesia)) {
      throw new Error('Indonesia category not found');
    }

    const url = json.indonesia[Math.floor(Math.random() * json.indonesia.length)];
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  app.get('/random/indonesia', async (req, res) => {
    try {
      const img = await cecanIndonesia();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};
