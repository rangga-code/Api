const axios = require("axios");

module.exports = function (app) {
  app.get("/stalker/stalktiktok", async (req, res) => {
    const { apikey, username } = req.query;

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

    if (!username || username.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'username' wajib diisi."
      });
    }

    try {
      const apiUrl = `https://api-varhad.my.id/stalker/tiktok?username=${encodeURIComponent(username.trim())}`;
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
        username: username.trim(),
        source: "tiktok.com",
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[TIKTOK STALKER]", error.message);
      
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          status: false,
          creator: "ibnu",
          message: "Username TikTok tidak ditemukan."
        });
      }
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal mengambil data profil TikTok"
      });
    }
  });
};