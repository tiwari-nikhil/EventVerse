import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, type, title, message, link = '', relatedEvent = null }) => {
  try {
    await Notification.create({ recipient, type, title, message, link, relatedEvent });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

export const generateJWT = (id) => {
  const { sign } = await import('jsonwebtoken');
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};
