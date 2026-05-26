/**
 * Vercel Serverless Function — Verify Firebase Session
 * 
 * Called by middleware to verify if a user is premium.
 * Checks the Firebase ID token and looks up Firestore for isPremium.
 * 
 * Environment variables needed (set in Vercel dashboard):
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Check Firestore for premium status
    const userDoc = await db.collection('users').doc(uid).get();
    const isPremium = userDoc.exists && userDoc.data().isPremium === true;

    return res.status(200).json({ isPremium, uid });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
