const axios = require('axios');
const qs = require('qs');

module.exports = function(app) {
  app.get('/download/pindl', async (req, res) => {
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

      if (!url.includes('pinterest.com/pin/') && !url.includes('pin.it/')) {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "URL Pinterest tidak valid"
        });
      }

      const mainPage = await axios.get('https://ilovepin.net/id', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const cookieString = mainPage.headers['set-cookie']?.join('; ') || '';

      const body = qs.stringify({ url: url });

      const { data } = await axios.post('https://ilovepin.net/proxy.php', body, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Accept-Language': 'id,en;q=0.9',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://ilovepin.net',
          'Referer': 'https://ilovepin.net/id'
        }
      });

      if (!data.api || data.api.status !== 'OK') {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "Gagal mengambil data Pinterest"
        });
      }

      const api = data.api;
      const items = api.mediaItems || [];

      const videos = items.filter(i => i.type === 'Video');
      const images = items.filter(i => i.type === 'Image');

      const result = {
        title: api.title || 'Tanpa judul',
        description: api.description?.trim() || '-',
        author: api.userInfo?.username || 'Unknown',
        media_count: items.length,
        media: []
      };

      if (videos.length > 0) {
        videos.sort((a, b) => {
          const sizeA = parseFloat(a.mediaFileSize) * (a.mediaFileSize.includes('MB') ? 1024 : 1);
          const sizeB = parseFloat(b.mediaFileSize) * (b.mediaFileSize.includes('MB') ? 1024 : 1);
          return sizeB - sizeA;
        });

        const bestVideo = videos[0];
        result.media.push({
          type: 'video',
          quality: bestVideo.mediaQuality === 'HD' ? 'HD' : `SD (${bestVideo.mediaRes})`,
          size: bestVideo.mediaFileSize,
          url: bestVideo.mediaUrl
        });

        if (videos.length > 1) {
          result.alternatives = videos.slice(1).map(v => ({
            quality: v.mediaQuality === 'HD' ? 'HD' : `SD (${v.mediaRes})`,
            size: v.mediaFileSize,
            url: v.mediaUrl
          }));
        }
      } else if (images.length > 0) {
        result.media = images.map(img => ({
          type: 'image',
          quality: 'Original',
          size: img.mediaFileSize,
          url: img.mediaUrl
        }));
      } else {
        return res.json({
          status: false,
          creator: "ibnu",
          message: "Tidak ada media yang ditemukan pada pin ini"
        });
      }

      return res.json({
        status: true,
        creator: "ibnu",
        original_url: url,
        result: result
      });

    } catch (e) {
      console.error("[PINDOWNLOADER]", e.message);
      
      return res.json({
        status: false,
        creator: "ibnu",
        message: `Error: ${e.message}`
      });
    }
  });
};
