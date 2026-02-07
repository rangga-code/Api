const axios = require("axios");

module.exports = function (app) {
  app.get("/search/tiktoks", async (req, res) => {
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
      const apiUrl = `https://ikyyzyyrestapi.my.id/search/tiktok?apikey=kyzz&query=${encodeURIComponent(q.trim())}`;
      const { data } = await axios.get(apiUrl);
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: data.result,
        total: Array.isArray(data.result) ? data.result.length : 0,
        query: q.trim(),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[TIKTOK SEARCH]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan pencarian TikTok"
      });
    }
  });
};