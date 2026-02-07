const axios = require("axios")

module.exports = (app) => {
  app.get("/randomv2/amelia", async (req, res) => {
    try {
      const { data } = await axios.get("https://pastebin.com/raw/mDfMhFCk")
      const list = data.amelia
      const random = list[Math.floor(Math.random() * list.length)]
      res.redirect(random)
    } catch (e) {
      res.status(500).send("Gagal ambil video")
    }
  })
}