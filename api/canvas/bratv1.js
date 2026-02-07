const axios = require("axios");

async function generateBratImage(text) {
  const API_KEY = "kyzz";
  
  try {
    const response = await axios.get(
      `https://ikyyzyyrestapi.my.id/canvas/bratv1?apikey=${API_KEY}&text=${encodeURIComponent(text)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Accept": "image/*",
          "Referer": "https://ikyyzyyrestapi.my.id/"
        },
        responseType: 'stream', // Penting: dapatkan sebagai stream
        timeout: 30000
      }
    );
    
    return response;
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
  app.get("/canvas/bratv1", async (req, res) => {
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
      const response = await generateBratImage(text.trim());
      const contentType = response.headers['content-type'] || 'image/png';
      const contentLength = response.headers['content-length'];
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'public, max-age=86400'); 
      res.setHeader('Creator', 'ibnu');
      
      response.data.pipe(res);
      
    } catch (error) {
      console.error(`BratV1 Canvas API Error: ${error.message}`);
      
      let statusCode = 500;
      let errorMessage = error.message;
      
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        statusCode = 400;
        errorMessage = "Parameter 'text' tidak valid atau terlalu panjang.";
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
