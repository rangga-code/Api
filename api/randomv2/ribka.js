const axios = require("axios")

module.exports = (app) => {
  app.get("/randomv2/ribka", async (req, res) => {
    try {
      const { data } = await axios.get("https://pastebin.com/raw/bKABSy5A")

      const links = data
        .split("\n")
        .map(v => v.trim())
        .filter(v => v.startsWith("http"))

      if (!links.length) return res.status(404).send("Link kosong")

      const random = links[Math.floor(Math.random() * links.length)]
      res.redirect(random)
    } catch (err) {
      res.status(500).send("Gagal ambil video")
    }
  })
}