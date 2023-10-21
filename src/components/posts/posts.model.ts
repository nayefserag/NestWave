import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger'; 

@Schema()
export class Posts extends mongoose.Document {
  @ApiProperty({ required: true })
  @Prop({ required: true })
  userId: string;

  @ApiProperty({ required: true }) 
  @Prop({ required: true , minlength: 1, maxlength: 450})
  post: string;

  @ApiProperty()
  @Prop({default : []})
  Image: Array<string>;
  
  @ApiProperty({default : []})
  @Prop()
  video: Array<string>;

  @ApiProperty({default : []})
  @Prop({default : []})
  comments: Array<string>;

  @ApiProperty({default : []})
  @Prop({default : []})
  likes: Array<string>;

  @ApiProperty({default : []})
  @Prop({default : []})
   hashtags: string[];;

}

export type PostDocument = Posts & Document;
export const PostSchema = SchemaFactory.createForClass(Posts);
