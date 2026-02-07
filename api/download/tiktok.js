const axios = require('axios');

async function downloadTikTok(url) {
  try {
    const response = await axios.get(
      `https://api-varhad.my.id/download/tt?url=${encodeURIComponent(url)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "https://api-varhad.my.id/"
        },
        timeout: 30000
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response received from API server');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  app.get("/download/tiktok", async (req, res) => {
    const { apikey, url } = req.query;

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

    if (!url || url.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'url' wajib diisi (URL TikTok).",
        creator: "ibnu"
      });
    }

    try {
      const result = await downloadTikTok(url.trim());
      
      if (result && result.status === true && result.result) {
        return res.json({
          status: true,
          data: {
            title: result.result.title || "TikTok Video",
            thumbnail: result.result.thumbnail,
            downloads: {
              video_sd: result.result.mp4,
              video_hd: result.result.mp4_hd,
              audio: result.result.mp3,
              photos: result.result.foto || []
            },
            metadata: {
              source: "TikTok",
              note: "kamu kaya asu"
            }
          },
          message: "TikTok download links retrieved successfully",
          creator: "ibnu",
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(502).json({
          status: false,
          message: result?.message || "Gagal mendapatkan data download dari TikTok",
          data: result || null,
          creator: "ibnu"
        });
      }
    } catch (error) {
      console.error(`TikTok Download API Error: ${error.message}`);
      
      let statusCode = 500;
      let errorMessage = error.message;
      
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        statusCode = 400;
        errorMessage = "URL TikTok tidak valid atau format salah.";
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
