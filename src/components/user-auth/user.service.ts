import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../model/user.model';
import { PasswordValidator } from 'src/middlewares/password.validator';
import { initializeFirebase } from 'src/config/firebase.config';
import { Multer } from 'multer';
import { UUID } from 'mongodb';
import * as path from 'path';
import { getStorage , ref , uploadBytesResumable , getDownloadURL} from 'firebase/storage'
initializeFirebase();
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) public  userModel: Model<UserDocument>,
    
  ) {  }

  async create(user: any ,profilePicture?: any ): Promise<User> {
    const newUser = new this.userModel(user);
    if (profilePicture) {
      newUser.profilePicture = await this.uploadImageToFirebase(profilePicture ,newUser._id ,'profilePicture')
      
    }
    if (!user.password) {
      newUser.name = user.name.firstName + ' ' + user.name.lastName;
      newUser.isVerified = true
      newUser.profilePicture = user.picture

    }
    else {
      newUser.password = await PasswordValidator.hashPassword(newUser.password)
    }
    return await newUser.save();
  }


  async uploadImageToFirebase(image: Multer.File,id :string , type: string) : Promise<any> {

    const storage = getStorage();
    const storageref = ref (storage, `images/${type}/user_${id}`);
    const metadata = {
      contentType: image.mimetype,
    }
    const snapshot = await uploadBytesResumable(storageref, image.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  }

  async update(user: User): Promise<User> {
    const user2 = await this.userModel.findByIdAndUpdate(user._id, user, { new: true });
    return user2
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }
  async findUser(email?: string | null ,model?:any): Promise<User | Error | any> {
    if (model) {
      this.userModel =model;
    }
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return new Error('User Not Found');
    }
    return user;


  }
  async findByid(id: string | null ,model?:any): Promise<Error | User | any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Error('Invalid User ObjectId');
    }
    else {
        if (model) {
          this.userModel =model;
        }
      const targetUser = await this.userModel.findById(id);
      if (targetUser === null || targetUser === undefined) {
        return new Error('User Not Found');
      }
      return targetUser;

    }
  }

  async updateUser(data: any, id: string): Promise<User | Error> {
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return new Error('Invalid User ObjectId');
    }
    else {
      const targetUser = await this.userModel.findByIdAndUpdate(id, data, { new: true });
      return targetUser
    }
  }

  async deleteUser(id: string): Promise<User | Error> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Error('Invalid User ObjectId');
    }
    else {
      const targetUser = await this.userModel.findByIdAndDelete(id);
      if (!targetUser) {
        return new Error('User Not Found');
      }
      return targetUser
    }
  }

  async updateToken(id: string, newRefreshToken: string): Promise<User | null | void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken: newRefreshToken }, { new: true });
  }

  // async googleSginIn(user: User): Promise<any> {
  //   const userExist = await this.findUser(user.email);
  //   if (userExist instanceof Error) {
  //     const newUser = await this.create(user);
  //     // const token = await this.jwtService.generateToken(newUser, '1h');
  //     // const refreshToken = await this.jwtService.generateToken(newUser, '3d');
  //     // newUser.refreshToken = refreshToken;
  //     await newUser.save();
  //     return {
  //       message: `Thanks ${newUser.name} To Register In My App ^_^`,
  //       newUser,
  //       // token,
  //       // refreshToken,
  //     };
  //   } else {
  //     // const token = await this.jwtService.generateToken(userExist, '1h');
  //     // const refreshToken = await this.jwtService.generateToken(userExist, '3d');
  //     // userExist.refreshToken = refreshToken;
  //     await userExist.save();
  //     return {
  //       // message: `Welcome Again ${user.name.firstName + ' ' + user.name.lastName} To My App ^_^`,
  //       user: userExist,
  //     };
  //   }
  // }

}