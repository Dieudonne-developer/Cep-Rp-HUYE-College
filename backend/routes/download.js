const express = require('express');
const router = express.Router();

const APPS = {
  'user-app': {
    url: 'https://expo.dev/artifacts/eas/iFZs136NoaOTXrmOsr80jKA0HUt3Oj6Yu0v95l9HEH0.apk',
    filename: 'CEP App.apk',
  },
  'admin-app': {
    url: 'https://expo.dev/artifacts/eas/Bg4bG6t-cP5aKnRaD2zspp-1sBhK25Xn6LAuI7CQEGM.apk',
    filename: 'Admin CEP.apk',
  },
};

router.get('/:app', async (req, res) => {
  const app = APPS[req.params.app];
  if (!app) {
    return res.status(404).json({ success: false, message: 'App not found' });
  }

  try {
    const upstream = await fetch(app.url, { redirect: 'follow' });
    if (!upstream.ok) {
      return res.status(502).json({ success: false, message: 'Failed to fetch app file' });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${app.filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
});

module.exports = router;
