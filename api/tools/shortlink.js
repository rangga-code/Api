const axios = require("axios");

module.exports = function (app) {
  app.get("/tools/shortlink", async (req, res) => {
    try {
      const { apikey, url } = req.query;

      if (!apikey) {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "Parameter apikey wajib diisi"
        });
      }

      if (apikey.trim() !== "uget") {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "API key tidak valid"
        });
      }

      if (!url) {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "Parameter url wajib diisi"
        });
      }

      if (!/^https?:\/\//i.test(url)) {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "URL tidak valid"
        });
      }

      const encodedUrl = encodeURIComponent(url);

      const apiUrl = `https://tinyurl.com/api-create.php?url=${encodedUrl}`;

      const response = await axios.get(apiUrl, {
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0 (TelegramBot; Shortlink API)"
        },
        responseType: "text"
      });

      const short = response.data?.trim();

      if (!short || !short.startsWith("http")) {
        throw new Error("TinyURL invalid response");
      }

      return res.json({
        status: true,
        creator: "ibnu",
        original: url,
        short
      });

    } catch (e) {
      console.error("[SHORTLINK]", e.message);

      return res.json({
        status: false,
        creator: "ibnu",
        message: "Gagal membuat shortlink"
      });
    }
  });
};
