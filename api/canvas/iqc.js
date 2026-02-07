const axios = require('axios');

module.exports = function(app) {
  app.get('/canvas/iqc', async (req, res) => {
    try {
      const { text, chatTime, statusBarTime } = req.query;
      if (!text) return res.status(400).json({ status: false, message: 'text wajib diisi' });

      const url = `https://api.deline.web.id/maker/iqc?text=${encodeURIComponent(text)}&chatTime=${encodeURIComponent(chatTime || '')}&statusBarTime=${encodeURIComponent(statusBarTime || '')}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
      res.send(response.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: false, message: e.message });
    }
  });
};