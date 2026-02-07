const axios = require('axios');

module.exports = function(app) {
  app.get('/randomv2/novy', async (req, res) => {
    try {
      const { data } = await axios.get('https://pastebin.com/raw/wuaNaQVk');
      const list = data.novy;

      if (!Array.isArray(list)) throw new Error('Invalid data');

      const url = list[Math.floor(Math.random() * list.length)];
      const video = await axios.get(url, { responseType: 'arraybuffer' });

      res.setHeader('Content-Type', 'video/mp4');
      res.send(Buffer.from(video.data));
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: false, message: e.message });
    }
  });
};