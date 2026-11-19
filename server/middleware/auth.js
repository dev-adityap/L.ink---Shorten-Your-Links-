import 'dotenv/config';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const missing = [
  ['FIREBASE_PROJECT_ID', projectId],
  ['FIREBASE_CLIENT_EMAIL', clientEmail],
  ['FIREBASE_PRIVATE_KEY', privateKey],
]
  .filter(([, value]) => !value || !String(value).trim())
  .map(([name]) => name);

if (missing.length) {
  throw new Error(
    `Missing required Firebase Admin environment variable(s): ${missing.join(', ')}. ` +
      'Set them in server/.env before starting the server.'
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export default verifyToken;
