import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty decorator

@Schema()
export class User extends mongoose.Document {
  @ApiProperty({ required: true })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ required: true })
  @Prop({ required: true })
  email: string;

  @ApiProperty()
  @Prop()
  password: string;

  @ApiProperty()
  @Prop({ default: 'https://firebasestorage.googleapis.com/v0/b/nest-js-403723.appspot.com/o/User_Images%2FprofilePicture%2Fdefault%20profile%20picture.png?alt=media&token=3751aa6d-24ac-4af8-8eef-c4ab28284720&_gl=1*1xcwewc*_ga*NTk3MDYwNjQwLjE2ODE4MzI3NDQ.*_ga_CW55HF8NVT*MTY5OTI2NTY1NS41My4xLjE2OTkyNjgwMjguMzkuMC4w' })
  profilePicture: string;

  @ApiProperty()
  @Prop({ default: 'https://firebasestorage.googleapis.com/v0/b/nest-js-403723.appspot.com/o/User_Images%2FcoverPicture%2Fdefault%20cover%20picture.jpg?alt=media&token=880d1309-0620-4a2a-b192-2a7c82df8374&_gl=1*uoum4w*_ga*NTk3MDYwNjQwLjE2ODE4MzI3NDQ.*_ga_CW55HF8NVT*MTY5OTI2NTY1NS41My4xLjE2OTkyNjgwNDQuMjMuMC4w' })
  coverPicture: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  followers: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  followings: string[];

  @ApiProperty({ default: false })
  @Prop({ default: false })
  isAdmin: boolean;

  @ApiProperty()
  @Prop({ default: '' })
  description: string;

  @ApiProperty({ maxLength: 50 }) 
  @Prop({ maxlength: 50 })
  city: string;

  @ApiProperty({ maxLength: 50 }) 
  @Prop({ maxlength: 50 })
  from: string;

  @ApiProperty({ enum: [1, 2, 3] })
  @Prop({ enum: [1, 2, 3] })
  relationship: number;

  @ApiProperty()
  @Prop({ default: '' })
  fcmToken: string;

  @ApiProperty()
  @Prop({ default: '' })
  googleId: string;

  @ApiProperty()
  @Prop({ default: '' })
  refreshToken: string;

  @ApiProperty({ default: false })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Prop({ default: '' })
  otp: string;

  @ApiProperty()
  @Prop({ default: '' })
  id: string;

  @ApiProperty()
  @Prop({ default: '' })
  resetcode: string;

}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
