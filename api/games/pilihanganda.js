const axios = require("axios");

module.exports = function (app) {
  app.get("/games/pilihanganda", async (req, res) => {
    const { apikey } = req.query;
    
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
      const response = await axios.get("https://ikyyzyyrestapi.my.id/games/pilihanganda", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)"
        },
        timeout: 10000
      });

      const questionData = response.data.result;
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: questionData,
        source: "Pilihan Ganda Game",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[GAMES PILIHANGANDA]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal mengambil soal pilihan ganda"
      });
    }
  });
};