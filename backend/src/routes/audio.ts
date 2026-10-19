import { Router } from 'express';

export const audioRouter = Router();

// Audio format converter / stem exporter ping
audioRouter.post('/render', (req, res) => {
  const { tracks, bpm, format = 'wav' } = req.body;
  if (!tracks || !Array.isArray(tracks)) {
    return res.status(400).json({ error: 'Tracks array is required for rendering' });
  }

  res.json({
    message: 'Server-side stem render request accepted',
    trackCount: tracks.length,
    bpm,
    format,
    status: 'READY'
  });
});
