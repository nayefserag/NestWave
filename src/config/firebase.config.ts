// import * as firebase from 'firebase/app';
// import * as serviceAccount from '../../secrets/firebaseconfig.json';
// export const initializeFirebase = () => {
//     firebase.initializeApp(serviceAccount );
    
// };

import * as admin from 'firebase-admin';
// import * as serviceAccount from '../../secrets/firebaseconfig.json';
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, 
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: 'gs://nest-js-403723.appspot.com/',
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// });

export const firebaseAdmin = admin;






// export const messaging = getMessaging(firebase.initializeApp(serviceAccount ));
// import * as admin from 'firebase-admin';

// export const initializeFirebase = () => {
//   const serviceAccount = require('../../secrets/firebaseconfig.json');
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(serviceAccount),
//   });
// };