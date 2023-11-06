import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Helpers } from '../../middlewares/helpers';
import { PostsService } from './posts.service';
import { Posts } from '../../model/posts.model';
import { PostUpdates } from 'src/dtos/update.post.dto';
import { PostValidator } from 'src/Validators/post.validator';
import { UserService } from '../user-auth/user.service';
import { Comment } from '../../model/comment.model';
import { CommentUpdates } from 'src/dtos/update.comment.dto';
import { ExistGuard } from 'src/guards/exist.guard';
import { ValidationGuard } from 'src/guards/validator.guard';
import { CommentValidator } from 'src/Validators/comment.validator';
import { FirebaseService } from 'src/service/firebase/firebase.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';


@Controller('posts')
@ApiTags('Post Controller')
export class PostsController {
    constructor(
        private readonly postService: PostsService,
        public readonly userService: UserService,
        private readonly firebaseService: FirebaseService
    ) { }

    @Post('newpost/:id')
    @UseGuards(ExistGuard(UserService))
    // @UseGuards(new ValidationGuard({ validator: PostValidator, validatorupdate: false }))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 10 }
    ]))
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBody({ type: Posts })
    @ApiResponse({ status: 201, description: 'Post Created' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async create(@Body() post: Posts, @UploadedFiles() files: { images?: Express.Multer.File[] , videos?: Express.Multer.File[] }, @Param('id') id: string, @Res() res: Response): Promise<void> {
        const hashtags = await Helpers.extractHashtags(post.post);
        const newpost = await this.postService.create(post);
        newpost.userId = id;
        if (files.images && files.images.length > 0)
        {
        newpost.Image = await this.firebaseService.uploadImagesToFirebase('Posts_Images', files.images, id, 'post');
        }
        if (files.videos && files.videos.length > 0)
        {
        newpost.video = await this.firebaseService.uploadImagesToFirebase('Posts_Videos', files.videos, id, 'post');
        }
        newpost.save();
        const updatedpost = await this.postService.updatehashtags(newpost._id, hashtags);
        res.status(201).json({ message: "Post Created", statusCode: 201 });

    }

    @Patch('update/:id')
    @UseGuards(ExistGuard(PostsService))
    @UseGuards(new ValidationGuard({ validator: PostValidator, validatorupdate: true }))
    @ApiOperation({ summary: 'Update a post' })
    @ApiBody({ type: PostUpdates })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Post Updated' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(@Body() post: PostUpdates, @Param('id') id: string, @Res() res: Response): Promise<void> {
        const author = await this.userService.findByid(post.userId);
        if (post.userId !== author._id.toString()) {
            res.status(403).json({ message: "Unauthorized", statusCode: 403 });
        }
        else {
            const updatedpost = await this.postService.updatepost(post, id);
            res.status(201).json({ message: "Post Updated", statusCode: 201 });
        }
    }

    @Delete('delete/:id')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'Delete a post' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Post Deleted By Admin' })
    @ApiResponse({ status: 200, description: 'Post Deleted' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    async delete(@Param('id') id: string, @Body() req: any, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const author = await this.userService.findByid(req.userId);
        if (targetPost.userId !== author._id.toString() && author.isAdmin == false) {
            res.status(403).json({ message: "Unauthorized", statusCode: 403 });
        }
        else {
            const updatedpost = await this.postService.deletepost(id);
            if (author.isAdmin == true) {
                res.status(201).json({ message: "Post Deleted By Admin", statusCode: 201 });
            }
            else {
                res.status(201).json({ message: "Post Deleted", statusCode: 201 });
            }
        }
    }

    @Get('getpost/:id')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async find(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        res.status(200).json({ message: targetPost, statusCode: 200 });

    }

    @Patch('react/:id')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'React to a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiBody({ type: Comment })
    @ApiResponse({ status: 201, description: 'Post Liked' })
    @ApiResponse({ status: 200, description: 'Post UnLiked' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async react(@Param('id') id: string, @Body() req: any, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const user = await this.userService.findByid(req.userId);
        if (user instanceof Error) {
            res.status(404).json({ message: user.message, statusCode: 404 });
        }
        else if (targetPost.likes.includes(user._id.toString())) {
            targetPost.likes = targetPost.likes.filter((userId) => userId !== user._id.toString());
            await this.postService.updatepost(targetPost, id);
            res.status(200).json({ message: "Post UnLiked", statusCode: 200 });
        }
        else {
            targetPost.likes.push(user._id.toString());
            const updatedPost = await this.postService.updatepost(targetPost, id);
            const notifiedUser = await this.userService.findByid(targetPost.userId);
            const notification = await this.firebaseService.sendNotification(notifiedUser.fcmToken, "Post Liked", `${user.name} liked your post`);
            console.log(notification);
            res.status(201).json({ message: "Post Liked", statusCode: 201 });
        }
    }

    @Patch('addcomment/:id')
    @UseGuards(ExistGuard(PostsService))
    @UseGuards(new ValidationGuard({ validator: CommentValidator, validatorupdate: false }))
    @ApiOperation({ summary: 'Add a comment to a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiBody({ type: Comment })
    @ApiResponse({ status: 201, description: 'Comment Added' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @ApiResponse({ status: 422, description: 'Validation failed' })

    async addcomment(@Param('id') id: string, @Body() req: Comment, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const user = await this.userService.findByid(req.userId);
        const comment = await this.postService.addcomment(req);
        targetPost.comments.push(comment);
        await targetPost.save();
        const updatedPost = await this.postService.updatepost(targetPost, id);
        const notifiedUser = await this.userService.findByid(targetPost.userId);
        const notification = await this.firebaseService.sendNotification(notifiedUser.fcmToken, "Post Liked", `${user.name} liked your post`);
        console.log("notification:", notification);
        res.status(201).json({ message: "Comment Added", statusCode: 201 });
    }

    @Delete('deletecomment/:id/:commentid')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async deleteComment(@Param('id') id: string, @Param('commentid') commentid: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })

        if (commentIndex === -1) {
            res.status(404).json({ error: 'Comment not found' });
        } else {
            targetPost.comments.splice(commentIndex, 1);
            await targetPost.save();
            res.status(200).json({ message: 'Comment deleted', statusCode: 200 });
        }

    }


    @Get('getcomments/:id')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'React to a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiParam({ name: 'userid', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Comment liked' })
    @ApiResponse({ status: 200, description: 'Comment unliked' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async getComments(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        res.status(200).json({ message: targetPost.comments, statusCode: 200 });

    }

    @Patch('reactcomment/:id/:commentid/:userid')
    @UseGuards(ExistGuard(PostsService))
    @ApiOperation({ summary: 'React to a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiParam({ name: 'userid', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Comment liked' })
    @ApiResponse({ status: 200, description: 'Comment unliked' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async reactcomment(@Param('id') id: string, @Param('userid') userid: string, @Param('commentid') commentid: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })
        if (commentIndex === -1) {
            res.status(404).json({ message: 'Comment not found', statusCode: 404 });
        } else {
            const userIndex = targetPost.comments[commentIndex].likes.persons.findIndex((userId: string) => { return userId === userid; })
            if (userIndex === -1) {
                targetPost.comments[commentIndex].likes.persons.push(userid);
                targetPost.comments[commentIndex].likes.number += 1;
                const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
                const notifiedUser = await this.userService.findByid(targetPost.comments[commentIndex].userId);
                const notification = await this.firebaseService.sendNotification(notifiedUser.fcmToken, "Comment Liked", `your comment liked`);
                console.log("notification:", notification);
                res.status(200).json({ message: 'Comment liked', statusCode: 200 });
            } else {
                targetPost.comments[commentIndex].likes.persons.splice(userIndex, 1);
                targetPost.comments[commentIndex].likes.number -= 1;
                const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
                res.status(200).json({ message: 'Comment unliked', statusCode: 200 });
            }

        }
    }


    @Patch('updatecomment/:id/:commentid')
    @UseGuards(ExistGuard(PostsService))
    @UseGuards(new ValidationGuard({ validator: CommentValidator, validatorupdate: true }))
    @ApiOperation({ summary: 'Update a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiBody({ type: CommentUpdates })
    @ApiResponse({ status: 200, description: 'Comment updated' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })

    async updatecomment(@Param('id') id: string, @Param('commentid') commentid: string, @Body() req: CommentUpdates, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findByid(id);
        const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })
        if (commentIndex === -1) {
            res.status(404).json({ message: 'Comment not found', statusCode: 404 });
        } else {
            targetPost.comments[commentIndex].text = req.text;
            const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
            res.status(200).json({ message: 'Comment updated', statusCode: 200 });
        }

    }



}