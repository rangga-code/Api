const axios = require("axios")

module.exports = (app) => {
  app.get("/randomv2/andin", async (req, res) => {
    try {
      const { data } = await axios.get("https://pastebin.com/raw/HMg3bdtZ")
      const list = data.andin
      if (!Array.isArray(list)) return res.status(500).json({ status: false })

      const pick = list[Math.floor(Math.random() * list.length)]
      const video = await axios.get(pick, { responseType: "arraybuffer" })

      res.setHeader("Content-Type", "video/mp4")
      res.end(video.data)
    } catch (e) {
      res.status(500).json({ status: false, error: e.message })
    }
  })
}