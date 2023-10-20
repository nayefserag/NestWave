import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class User extends mongoose.Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: '' })
  profilePicture: string;

  @Prop({ default: '' })
  coverPicture: string;

  @Prop({ type: [String], default: [] })
  followers: string[];

  @Prop({ type: [String], default: [] })
  followings: string[];

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: '' })
  description: string;

  @Prop({ maxlength: 50 })
  city: string;

  @Prop({ maxlength: 50 })
  from: string;

  @Prop({ enum: [1, 2, 3] })
  relationship: number;

  @Prop()
  fcmToken: string;

  @Prop({ default: '' })
  googleId: string;

  @Prop({ default: '' })
  refreshToken: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: '' })
  otp: string;
  
  @Prop({ default: '' })
  id: string;


}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
