const axios = require('axios');

module.exports = function (app) {
  app.get('/enchaher/hd', async (req, res) => {
    const { apikey, imageUrl } = req.query;
    
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

    if (!imageUrl || imageUrl.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'imageUrl' wajib diisi."
      });
    }

    try {
      const targetApiUrl = `https://api-varhad.my.id/tools/hd?imageUrl=${encodeURIComponent(imageUrl.trim())}`;
      
      const response = await axios.get(targetApiUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
        },
        timeout: 30000
      });

      const contentType = response.headers['content-type'];
      
      res.set({
        'Content-Type': contentType || 'image/jpeg',
        'Content-Length': response.headers['content-length'],
        'Cache-Control': 'public, max-age=86400'
      });

      return res.send(response.data);

    } catch (error) {
      console.error("[HD IMAGE API]", error.message);
      
      if (error.response) {
        const errorContentType = error.response.headers['content-type'];
        
        if (errorContentType && errorContentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(Buffer.from(error.response.data).toString('utf8'));
            return res.status(error.response.status).json({
              status: false,
              creator: "ibnu",
              message: `API Error: ${errorData.message || 'Unknown error from upstream API'}`
            });
          } catch (e) {
            return res.status(error.response.status).json({
              status: false,
              creator: "ibnu",
              message: `Upstream API returned status ${error.response.status}`
            });
          }
        } else if (errorContentType && errorContentType.includes('image')) {
          res.set('Content-Type', errorContentType);
          return res.status(error.response.status).send(error.response.data);
        }
      }
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal memproses permintaan HD image"
      });
    }
  });
};