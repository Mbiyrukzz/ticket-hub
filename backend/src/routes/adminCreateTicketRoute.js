const { v4: uuidv4 } = require('uuid');
const { ticketsCollection, usersCollection } = require('../db.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js');
const logActivity = require('../middleware/logActivity.js');

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'Uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const adminCreateTicketRoute = {
  path: '/admins/:userId/tickets',
  method: 'post',
  middleware: [upload.single('image'), verifyAuthToken],
  handler: async (req, res) => {
    try {
      const authUser = req.user;
      const { userId } = req.params;
      const users = usersCollection();
      const tickets = ticketsCollection();

      // Ensure the authenticated user is creating a ticket for themselves
     if (!authUser.isAdmin) {
  return res.status(403).json({ error: 'Only admins can create tickets for others' });
}


      const { title, content, priority } = req.body;

      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const userDoc = await users.findOne({ id: userId });

      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userName =
        userDoc.name ||
        userDoc.displayName ||
        userDoc.email?.split('@')[0] ||
        'Unknown';

      const ticketId = uuidv4();
      const image = req.file
        ? `${process.env.IMAGE_UPLOAD}/${req.file.filename}`
        : null;

      const newTicket = {
        id: ticketId,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'Medium', // Default to Medium if not provided
        image,
        createdBy: authUser.uid,
        assignedTo: authUser.uid,
        assignedToName: userName,
        createdAt: new Date(),
        comments: [],
        createdByAdmin: true,

      };

      const session = tickets.client.startSession();
      let response;

      try {
        await session.withTransaction(async () => {
          const result = await tickets.insertOne(newTicket);
          const mongoId = result.insertedId;

          const userUpdate = await users.updateOne(
            { id: userId },
            { $push: { tickets: ticketId } }
          );

          if (userUpdate.modifiedCount === 0) {
            throw new Error('Failed to assign ticket to user');
          }

          await logActivity(
            'user-created-ticket',
            `User created ticket #${ticketId}`,
            authUser.uid,
            ticketId
          );

          response = {
            ...newTicket,
            _id: mongoId.toString(),
            createdAt: newTicket.createdAt.toISOString(),
          };
        });
      } finally {
        await session.endSession();
      }

      res.status(201).json(response);
    } catch (error) {
      console.error('❌ User ticket creation error:', error.message);
      res.status(500).json({
        error: 'Failed to create ticket',
        details: error.message,
      });
    }
  },
};

module.exports = { adminCreateTicketRoute };