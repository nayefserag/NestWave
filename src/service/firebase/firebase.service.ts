import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api'
// import { firebaseAdmin } from './firebase-admin.service';
import { getStorage , ref , uploadBytesResumable , getDownloadURL} from 'firebase/storage'
import { firebaseAdmin, firebaseConfig } from 'src/config/firebase.config';
import { initializeApp } from 'firebase/app'; 
@Injectable()
export class FirebaseService {
  
  constructor() {
  }
  async uploadImageToFirebase(foldername: string,image: Express.Multer.File,id :string , type: string) : Promise<any> {
    
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        const storageref = ref (storage, `${foldername}/${type}/${type}_${id}`);
        const metadata = {
          contentType: image.mimetype,
        }
        const snapshot = await uploadBytesResumable(storageref, image.buffer, metadata);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      }

  async uploadImagesToFirebase(foldername: string, images: Express.Multer.File[], id: string, type: string): Promise<string[]> {
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const urls: string[] = [];
  
    for (const image of images) {
      const storageref = ref(storage, `${foldername}/${type}/user_${id}/${image.originalname}`);
      const metadata = {
        contentType: image.mimetype,
      };
  
      const snapshot = await uploadBytesResumable(storageref, image.buffer, metadata);
      const url = await getDownloadURL(snapshot.ref);
      urls.push(url);
    }
    return urls;
  }
      async sendNotification(userToken: string, title: string, body: string) {
        try {

          const fcmPayload :admin.messaging.Message = {
            token: userToken,
            notification: {
              title: title,
              body: body
            },
          };
          
          
          const response = await admin.messaging().send(fcmPayload);
          console.log('Notification sent successfully:', response);
          return response;
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
}
