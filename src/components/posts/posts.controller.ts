import { Body, Controller, Delete, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import {Helpers} from '../../middlewares/helpers';
import { PostsService } from './posts.service';
import { ApiTags } from '@nestjs/swagger';
import { Posts } from './posts.model';
import { PostUpdates } from 'src/dtos/update.post.dto';
import { PostValidator } from 'src/Validators/post.validator';
import { UserService } from '../user-auth/user.service';
@Controller('posts')
@ApiTags('Post Controller')
export class PostsController {
    constructor( 
        private readonly postService: PostsService ,
        private readonly userService: UserService ,
    ){}

@Post('newpost')
async create(@Body() post: Posts ,@Res() res :Response): Promise<void>{
    const author = await this.userService.findUserById(post.userId);
    if (author instanceof Error )
    {
        res.status(400).json(author.message);
    }
    else{
    const hashtags = await Helpers.extractHashtags(post.post);
    const newpost =await this.postService.create(post);
    const updatedpost =await this.postService.updatehashtags(newpost._id,hashtags);
    res.status(201).json({message :"Post Created",updatedpost});
    }
    }

@Patch('update/:id')
async update(@Body() post: PostUpdates ,@Param('id') id:string,@Req() req,@Res() res :Response): Promise<void>{
    const targetPost = await this.postService.findOne(id);
    const author = await this.userService.findUserById(post.userId);
    if (author instanceof Error )
    {
        res.status(400).json(author.message);
    }
    else if (targetPost instanceof Error){
        res.status(400).json(targetPost.message);
    }
    else{
    const validation =PostValidator.validateUpdate(post);
    if (post.userId !== author._id.toString()) {
        res.status(403).json('Unauthorized');
    }
    if (validation.error) {
        res.status(400).json({ error: validation.error.details[0].message });
    }
    else{
    const updatedpost =await this.postService.updatepost(post,id);
    res.status(201).json({message :"Post Updated",updatedpost});
    }
    }
}

// @Delete('delete/:postid')
// async delete(@Param('postid') postid:string,@Req() userId:string,@Res() res :Response): Promise<void>{
//     const targetPost = await this.postService.findOne(postid);
//     const author = await this.userService.findUserById(userId);
//     if (author instanceof Error )
//     {
//         res.status(400).json(author.message);
//     }
//     else if (targetPost instanceof Error){
//         res.status(400).json(targetPost.message);
//     }
//     if (targetPost.userId !== author._id.toString()) {
//         res.status(403).json('Unauthorized');
//     }
// }

}
