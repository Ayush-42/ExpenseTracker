const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const verifyUser = require('../middleware/verifyUser');

const PHOTO_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_PHOTO_CHARS = 3 * 1024 * 1024;

const toResponse = (profile) => ({
  displayName: profile ? profile.displayName : '',
  photoData: profile ? profile.photoData : '',
  updatedAt: profile ? profile.updatedAt : null,
});

router.get('/', verifyUser, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.userId });
    res.json(toResponse(profile));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', verifyUser, async (req, res) => {
  try {
    const { displayName, photoData } = req.body;
    const update = { updatedAt: Date.now() };

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.trim().length > 60) {
        return res.status(400).json({ error: 'Name must be text of 60 characters or less' });
      }
      update.displayName = displayName.trim();
    }

    if (photoData !== undefined) {
      if (photoData === '') {
        update.photoData = '';
      } else if (typeof photoData !== 'string' || !PHOTO_PATTERN.test(photoData)) {
        return res.status(400).json({ error: 'Picture must be a PNG, JPEG or WebP image' });
      } else if (photoData.length > MAX_PHOTO_CHARS) {
        return res.status(413).json({ error: 'Image is too large. Please pick a smaller picture.' });
      } else {
        update.photoData = photoData;
      }
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: update, $setOnInsert: { userId: req.userId } },
      { new: true, upsert: true }
    );

    res.json(toResponse(profile));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.delete('/photo', verifyUser, async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { photoData: '', updatedAt: Date.now() }, $setOnInsert: { userId: req.userId } },
      { new: true, upsert: true }
    );

    res.json(toResponse(profile));
  } catch (error) {
    console.error('Error removing profile photo:', error);
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
});

module.exports = router;
