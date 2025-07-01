const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    console.log('⚠️ Unauthorized: Admin access required', {
      userId: req.user.uid,
    })
    return res
      .status(403)
      .json({ error: 'Unauthorized: Admin access required' })
  }
  console.log('✅ Admin access granted:', { userId: req.user.uid })
  next()
}

module.exports = { verifyAdmin }
