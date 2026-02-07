const axios = require('axios');

module.exports = function(app) {

  async function cecanKayes() {
    const { data } = await axios.get('https://pastebin.com/raw/7qYeeCnH', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = typeof data === 'string' ? JSON.parse(data) : data;

    if (!Array.isArray(json)) {
      throw new Error('Format JSON tidak valid');
    }

    const urls = json
      .map(item => item.url)
      .filter(url => typeof url === 'string' && url.startsWith('http'));

    if (urls.length === 0) {
      throw new Error('Tidak ada URL valid');
    }

    const randomUrl = urls[Math.floor(Math.random() * urls.length)];

    const res = await axios.get(randomUrl, {
      responseType: 'arraybuffer',
      timeout: 15000
    });

    return Buffer.from(res.data);
  }

  app.get('/random/kayes', async (req, res) => {
    try {
      const img = await cecanKayes();
      res.set('Content-Type', 'image/jpeg');
      res.send(img);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  });

};