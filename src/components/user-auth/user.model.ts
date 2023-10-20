import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty decorator

@Schema()
export class User extends mongoose.Document {
  @ApiProperty({ required: true }) // Add Swagger documentation
  @Prop({ required: true })
  name: string;

  @ApiProperty({ required: true }) // Add Swagger documentation
  @Prop({ required: true })
  email: string;

  @ApiProperty()
  @Prop()
  password: string;

  @ApiProperty()
  @Prop({ default: '' })
  profilePicture: string;

  @ApiProperty()
  @Prop({ default: '' })
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

  @ApiProperty({ maxLength: 50 }) // Use 'maxLength' instead of 'maxlength'
  @Prop({ maxlength: 50 })
  city: string;

  @ApiProperty({ maxLength: 50 }) // Use 'maxLength' instead of 'maxlength'
  @Prop({ maxlength: 50 })
  from: string;

  @ApiProperty({ enum: [1, 2, 3] })
  @Prop({ enum: [1, 2, 3] })
  relationship: number;

  @ApiProperty()
  @Prop()
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
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
