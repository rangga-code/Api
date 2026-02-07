const axios = require('axios');

async function getAsupanLinks() {
  try {
    const response = await axios.get(
      'https://pastebin.com/raw/eqPitxhj',
      {
        timeout: 5000
      }
    );
    
    const links = response.data.trim().split('\n')
      .filter(link => link.trim().length > 0);
    
    return links;
  } catch (error) {
    return [];
  }
}

module.exports = function (app) {
  app.get("/okep/asupan", async (req, res) => {
    const { apikey } = req.query;

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
        message: "API key tidak valid.",
        creator: "ibnu"
      });
    }

    try {
      const videoLinks = await getAsupanLinks();
      
      if (videoLinks.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Tidak ada video asupan tersedia.",
          creator: "ibnu"
        });
      }
      
      const randomIndex = Math.floor(Math.random() * videoLinks.length);
      const selectedVideo = videoLinks[randomIndex];
      
      return res.json({
        status: true,
        data: {
          video_url: selectedVideo,
          total_videos: videoLinks.length,
          note: "Download video dari URL di atas"
        },
        message: "Random asupan video link",
        creator: "ibnu"
      });
      
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Gagal mengambil daftar video",
        creator: "ibnu"
      });
    }
  });
};
