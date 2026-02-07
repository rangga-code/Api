const axios = require("axios");

async function askMetaAI(text) {
  const API_KEY = "kyzz";
  
  try {
    const response = await axios.get(
      `http://ikyyzyyrestapi.my.id/ai/metaai?apikey=${API_KEY}&text=${encodeURIComponent(text)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "http://ikyyzyyrestapi.my.id/"
        },
        timeout: 30000
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response received from API server');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  app.get("/ai/metaai", async (req, res) => {
    const { apikey, text } = req.query;

    if (!apikey || apikey.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'apikey' wajib diisi.",
        creator: "ibnu"
      });
    }

    if (apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "API key tidak valid atau tidak aktif.",
        creator: "ibnu",
        note: "Gunakan API key: 'uget'"
      });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'text' wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const result = await askMetaAI(text.trim());
      
      if (result && result.status === true && result.result) {
        return res.json({
          status: true,
          data: { text: result.result },
          message: "AI response successful",
          creator: "ibnu",
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(502).json({
          status: false,
          message: result?.message || "Gagal mendapatkan respons yang valid dari AI",
          data: result || null,
          creator: "ibnu"
        });
      }
    } catch (error) {
      console.error(`MetaAI API Error: ${error.message}`);
      
      let statusCode = 500;
      let errorMessage = error.message;
      
      if (error.message.includes('API Error: 4')) {
        statusCode = 400;
      } else if (error.message.includes('No response')) {
        statusCode = 504;
        errorMessage = "API server tidak merespons. Coba lagi nanti.";
      } else if (error.message.includes('API Error: 5')) {
        statusCode = 502;
        errorMessage = "API eksternal mengalami masalah.";
      }
      
      return res.status(statusCode).json({
        status: false,
        message: errorMessage,
        creator: "ibnu",
        timestamp: new Date().toISOString()
      });
    }
  });
};
