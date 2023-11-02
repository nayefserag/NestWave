import * as firebase from 'firebase/app';
import * as serviceAccount from '../../secrets/firebaseconfig.json';
export const initializeFirebase = () => {
    firebase.initializeApp(serviceAccount );
};

