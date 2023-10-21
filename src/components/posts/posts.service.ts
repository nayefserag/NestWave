import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, isValidObjectId } from 'mongoose';
import { Posts , PostDocument } from './posts.model';
import { Helpers } from '../../middlewares/helpers';

@Injectable()
export class PostsService {
    constructor(@InjectModel(Posts.name) private readonly PostModel: Model<PostDocument>) { }


async create(post: Posts): Promise<Posts> {
    const newPost = new this.PostModel(post);
    await newPost.save();
    return newPost;
}

async findOne(id: string | null): Promise<Posts  | Error> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Error('Invalid Post ID' );
    }
    else{
        const post =  await this.PostModel.findById(id);
        if(post == null)
        {
            return new Error('Post Not Found' );

        }
        else
        {
            return post
        }
}
}

async delete(id: string): Promise<Posts> {
    return await this.PostModel.findByIdAndRemove(id);
}


async updatepost(data: any, id: string): Promise<Posts | Error> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Error('Invalid ObjectId');
    }
    else {
        const targetPost = await this.PostModel.findByIdAndUpdate(id, data, { new: true });
        return targetPost
    }
}

async updatehashtags(id : string , hashtags: Array<string>): Promise<void> {
    return  await this.PostModel.findByIdAndUpdate(id ,{
        hashtags: hashtags 
    }, 
    { new: true });
    
    
}


async findAll(): Promise<Posts[]> {
    return await this.PostModel.find().exec();
}


}
