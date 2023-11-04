// import * as firebase from 'firebase/app';
// import * as serviceAccount from '../../secrets/firebaseconfig.json';
// export const initializeFirebase = () => {
//     firebase.initializeApp(serviceAccount );
    
// };

import * as admin from 'firebase-admin';
import * as serviceAccount from '../../secrets/firebaseconfig.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const firebaseAdmin = admin;






// export const messaging = getMessaging(firebase.initializeApp(serviceAccount ));
// import * as admin from 'firebase-admin';

// export const initializeFirebase = () => {
//   const serviceAccount = require('../../secrets/firebaseconfig.json');
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(serviceAccount),
//   });
// };