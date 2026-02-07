const axios = require("axios");

async function downloadInstagram(query) {
  const API_KEY = "kyzz";
  
  try {
    const response = await axios.get(
      `http://ikyyzyyrestapi.my.id/download/instagram?apikey=${API_KEY}&query=${encodeURIComponent(query)}`,
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
      const errorMsg = error.response.data ? JSON.stringify(error.response.data) : error.response.statusText;
      throw new Error(`API Error ${error.response.status}: ${errorMsg}`);
    } else if (error.request) {
      throw new Error('No response received from API server');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  app.get("/download/instagram", async (req, res) => {
    const { apikey, query } = req.query;

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

    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'query' wajib diisi (URL Instagram).",
        creator: "ibnu"
      });
    }

    try {
      const result = await downloadInstagram(query.trim());
      
      if (result && result.status === true && result.result && result.result.download_urls) {
        return res.json({
          status: true,
          data: {
            download_urls: result.result.download_urls,
            metadata: result.result.metadata
          },
          message: "Instagram download successful",
          creator: "ibnu",
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(502).json({
          status: false,
          message: result?.message || "Gagal mendapatkan data download dari Instagram",
          data: result || null,
          creator: "ibnu"
        });
      }
    } catch (error) {
      console.error(`Instagram Download API Error: ${error.message}`);
      
      let statusCode = 500;
      let errorMessage = error.message;
      
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        statusCode = 400;
        errorMessage = "URL Instagram tidak valid atau format query salah.";
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        statusCode = 502;
        errorMessage = "API key untuk akses eksternal ditolak.";
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
