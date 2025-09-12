const admin = require('firebase-admin');

// Initialize Firebase Admin without service account (for production)
let firebaseApp = null;

const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      // For production deployment, use environment variables
      if (process.env.NODE_ENV === 'production') {
        firebaseApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'psctech-school-portal'
        });
      } else {
        // For development, try to use service account if available
        try {
          const serviceAccount = require('../firebase/service-account.json');
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } catch (error) {
          console.warn('Service account not found, using default credentials');
          firebaseApp = admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'psctech-school-portal'
          });
        }
      }
    }
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

const verifyToken = async (idToken) => {
  try {
    const app = initializeFirebase();
    const decodedToken = await admin.auth(app).verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  verifyToken,
  admin
};


