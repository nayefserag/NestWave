import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Comment {
  [x: string]: any;
  @ApiProperty()
  @Prop({ required: true })
  text: string;

  @ApiProperty()
  @Prop({
    type: {
      number: Number,
      persons: [String],
    },
    default: { number: 0, persons: [] },
  })
  likes: { number: number; persons: string[] };

  @ApiProperty()
  @Prop({ required: true })
  userId: string;
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
