const axios = require("axios");

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function checkIMEI(imei) {
  try {
    const response = await axios.get(
      `https://api-varhad.my.id/tools/cekimei?q=${imei}`,
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
    throw new Error(`Failed to check IMEI: ${error.message}`);
  }
}

module.exports = function (app) {
  app.get("/tools/cekimei", async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'q' (IMEI) wajib diisi.",
        creator: "ibnu"
      });
    }
    try {
      const result = await checkIMEI(q);
      if (result) {
        if (result.creator) {
          delete result.creator;
        }
        if (result.status !== undefined) {
          delete result.status;
        }
        return res.json({
          status: true,
          data: result.data || result,
          message: "IMEI check successful",
          creator: "ibnu"
        });
      } else {
        return res.json({
          status: false,
          message: "Data tidak ditemukan atau format response tidak sesuai",
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
