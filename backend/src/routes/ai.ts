import { Router } from 'express';

export const aiRouter = Router();

aiRouter.post('/generate-lyrics', (req, res) => {
  const { prompt = 'late night drive synthwave', genre = 'synthwave' } = req.body;
  res.json({
    genre,
    prompt,
    lyrics: `[Verse 1]\nNeon signs reflecting in the rain\nSpeeding down the highway through the pain\nAnalog pulse in forty-eight K\n\n[Chorus]\nZelton echoes in the midnight air\nFrequencies alive without a care`
  });
});
