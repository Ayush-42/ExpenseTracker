// Requests carry the Firebase UID in a header; every route scopes its data to it.
module.exports = function verifyUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }
  req.userId = userId;
  next();
};
