import { Injectable } from '@nestjs/common';
import { Multer } from 'multer';
import { getStorage , ref , uploadBytesResumable , getDownloadURL} from 'firebase/storage'
import { initializeFirebase } from 'src/config/firebase.config';
initializeFirebase();
@Injectable()
export class FirebaseService {
 async uploadImageToFirebase(image: Express.Multer.File,id :string , type: string) : Promise<any> {

        const storage = getStorage();
        const storageref = ref (storage, `images/${type}/user_${id}`);
        const metadata = {
          contentType: image.mimetype,
        }
        const snapshot = await uploadBytesResumable(storageref, image.buffer, metadata);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      }
}
