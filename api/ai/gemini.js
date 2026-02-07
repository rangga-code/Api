const axios = require("axios");

async function askGeminiAI(prompt) {
  try {
    const response = await axios.get(
      `https://api-varhad.my.id/ai/gemini?prompt=${encodeURIComponent(prompt)}`,
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
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response received from API server');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  app.get("/ai/gemini", async (req, res) => {
    const { prompt } = req.query;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'prompt' wajib diisi dan tidak boleh kosong.",
        creator: "ibnu"
      });
    }

    try {
      const result = await askGeminiAI(prompt.trim());
      
      if (result && result.status === true && result.result && result.result.text) {
        const cleanedResult = {
          text: result.result.text,
          sessionId: result.result.sessionId
        };
        
        return res.json({
          status: true,
          data: cleanedResult,
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
      console.error(`Gemini API Error: ${error.message}`);
      
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
