const axios = require("axios");

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function askDolphinAI(prompt) {
  try {
    const response = await axios.get(
      `https://api-varhad.my.id/ai/dolphin?prompt=${encodeURIComponent(prompt)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "https://api-varhad.my.id/"
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

module.exports = function (app) {
  app.get("/ai/dolphin", async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'prompt' wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const result = await askDolphinAI(prompt);
      
      if (result) {
        // HAPUS creator dari API asli jika ada
        if (result.creator) {
          delete result.creator;
        }
        // HAPUS status dari API asli jika ada  
        if (result.status !== undefined) {
          delete result.status;
        }
        
        return res.json({
          status: true,
          data: result,
          message: "AI response successful",
          creator: "ibnu"
        });
      } else {
        return res.json({
          status: false,
          message: "Gagal mendapatkan respons dari AI",
          creator: "ibnu"
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        creator: "ibnu"
      });
    }
  });
};
