const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  app.get('/search/gimage', async (req, res) => {
    const { apikey, q } = req.query;
    
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
    
    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'q' (query) wajib diisi."
      });
    }
    
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q.trim())}&tbm=isch`;
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
      
      const response = await axios.get(searchUrl, { headers });
      const $ = cheerio.load(response.data);
      
      const images = [];
      
      $('img').each((i, element) => {
        const src = $(element).attr('src');
        if (src && src.startsWith('http')) {
          images.push({
            url: src,
            thumbnail: src,
            title: $(element).attr('alt') || q.trim()
          });
        }
      });
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: images,
        total: images.length,
        query: q.trim(),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[GIMAGE SEARCH]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan pencarian gambar"
      });
    }
  });
};