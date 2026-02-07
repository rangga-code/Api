const axios = require("axios");

module.exports = function (app) {
  app.get("/berita/tribun", async (req, res) => {
    const { apikey, limit } = req.query;
    
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

    try {
      const response = await axios.get("http://ikyyzyyrestapi.my.id/berita/tribun", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        timeout: 10000
      });

      const newsData = response.data;
      let newsItems = newsData.result || newsData.data || [];
      
      const itemLimit = parseInt(limit) || 10;
      if (itemLimit > 0 && newsItems.length > itemLimit) {
        newsItems = newsItems.slice(0, itemLimit);
      }
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: newsItems,
        total: newsItems.length,
        source: "tribunnews.com",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[TRIBUN NEWS]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal mengambil berita dari Tribun"
      });
    }
  });
};