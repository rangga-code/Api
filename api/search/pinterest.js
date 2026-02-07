const axios = require("axios");

module.exports = function (app) {
  app.get("/search/pinterest", async (req, res) => {
    const { apikey, q, limit } = req.query;

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
      const targetLimit = parseInt(limit) || 10;
      const apiUrl = `https://api-varhad.my.id/search/pinterest?query=${encodeURIComponent(q.trim())}&limit=${targetLimit}`;
      const { data } = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)"
        },
        timeout: 15000
      });

      return res.json({
        status: true,
        creator: "ibnu",
        data: data.result,
        total: data.count,
        query: q.trim(),
        source: "pinterest.com",
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[PINTEREST SEARCH]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan pencarian Pinterest"
      });
    }
  });
};