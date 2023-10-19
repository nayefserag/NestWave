import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserValidator } from '../middlewares/user.validator';
import { User, UserDocument } from './user.model';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(user): Promise<User> {
    const newUser = new this.userModel(user);
    newUser.password = await UserValidator.hashPassword(newUser.password)
    // newUser.otp = otp
    // newUser.refreshToken = refreshtoken
    return await newUser.save();
  }
  async update(user: User): Promise<User> {
    const user2 =await this.userModel.findByIdAndUpdate(user._id, user);
    return user2
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }
  async findUser(email?: string | null ): Promise<User | null> {
    const user = await this.userModel.findOne({
       email 
    });
      return user;

  }
  async updateUser(data : any, id : string): Promise<User | Error> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
     return  new Error('Invalid ObjectId');
    }
    else{
    const targetUser =await this.userModel.findByIdAndUpdate(id, data);
    console.log(targetUser)
    return targetUser
    }



  }

  async updateToken(id :string ,newRefreshToken: string): Promise<User | null |void> {
    await this.userModel.findByIdAndUpdate(id,{refreshToken: newRefreshToken}, {new: true});
}
}