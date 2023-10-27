import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import { PostExistGuard, PostUpdateValidationGuard, PostValidationGuard } from 'src/middlewares/post.middleware';
import { UserExistGuard } from 'src/middlewares/user.middleware';
import { CommentUpdateValidationGuard, CommentValidationGuard } from 'src/middlewares/comment.middleware';
@Controller('posts')
@ApiTags('Post Controller')
export class PostsController {
    constructor(
        private readonly postService: PostsService,
        private readonly userService: UserService,
    ) { }

    @Post('newpost/:id')
    @UseGuards(UserExistGuard)
    @UseGuards(PostValidationGuard)
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBody({ type: Posts })
    @ApiResponse({ status: 201, description: 'Post Created' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    async create(@Body() post: Posts, @Param('id') id: string, @Res() res: Response): Promise<void> {
        const hashtags = await Helpers.extractHashtags(post.post);
        const newpost = await this.postService.create(post);
        newpost.userId = id;
        newpost.save();
        const updatedpost = await this.postService.updatehashtags(newpost._id, hashtags);
        res.status(201).json({ message: "Post Created", updatedpost });

    }

    @Patch('update/:id')
    @UseGuards(PostExistGuard)
    @UseGuards(PostUpdateValidationGuard)
    @ApiOperation({ summary: 'Update a post' })
    @ApiBody({ type: PostUpdates })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Post Updated' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    async update(@Body() post: PostUpdates, @Param('id') id: string, @Res() res: Response): Promise<void> {
        const author = await this.userService.findUserById(post.userId);
        if (author instanceof Error) {
            res.status(400).json(author.message);
        }
        else {
            const validation = PostValidator.validateUpdate(post);
            if (validation.error) {
                res.status(400).json({ error: validation.error.details[0].message });
            }
            if (post.userId !== author._id.toString()) {
                res.status(403).json('Unauthorized');
            }
            else {
                const updatedpost = await this.postService.updatepost(post, id);
                res.status(201).json({ message: "Post Updated", updatedpost });
            }
        }
    }

    @Delete('delete/:id')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'Delete a post' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Post Deleted By Admin' })
    @ApiResponse({ status: 200, description: 'Post Deleted' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 403, description: 'Unauthorized' })
    async delete(@Param('id') id: string, @Body() req: any, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        const author = await this.userService.findUserById(req.userId);
        if (author instanceof Error) {
            res.status(400).json(author.message);
        }
        else if (targetPost instanceof Error) {
            res.status(400).json(targetPost.message);
        }
        else if (targetPost.userId !== author._id.toString() && author.isAdmin == false) {
            res.status(403).json('Unauthorized');
        }
        else {
            const updatedpost = await this.postService.deletepost(id);
            if (author.isAdmin == true) {
                res.status(201).json({ message: "Post Deleted By Admin", updatedpost });
            }
            else {
                res.status(201).json({ message: "Post Deleted", updatedpost });
            }
        }
    }

    @Get('getpost/:id')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async find(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        res.status(200).json(targetPost);

    }

    @Patch('react/:id')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'React to a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiBody({ type: Comment })
    @ApiResponse({ status: 201, description: 'Post Liked' })
    @ApiResponse({ status: 200, description: 'Post UnLiked' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async react(@Param('id') id: string, @Body() req: any, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        const user = await this.userService.findUserById(req.userId);
        if (user instanceof Error) {
            res.status(400).json(user.message);
        }
        else {
            if (targetPost.likes.includes(user._id.toString())) {
                targetPost.likes = targetPost.likes.filter((userId) => userId !== user._id.toString());
                const updatedPost = await this.postService.updatepost(targetPost, id);
                res.status(200).json({ message: "Post UnLiked", updatedPost });
            }
            else {
                targetPost.likes.push(user._id.toString());
                const updatedPost = await this.postService.updatepost(targetPost, id);
                res.status(201).json({ message: "Post Liked", updatedPost });
            }

        }
    }

    @Patch('addcomment/:id')
    @UseGuards(PostExistGuard)
    @UseGuards(CommentValidationGuard)
    @ApiOperation({ summary: 'Add a comment to a post' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiBody({ type: Comment })
    @ApiResponse({ status: 201, description: 'Comment Added' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async addcomment(@Param('id') id: string, @Body() req: Comment, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        const user = await this.userService.findUserById(req.userId);
        if (user instanceof Error) {
            res.status(400).json(user.message);
        }
        else {
            const comment = await this.postService.addcomment(req);
            targetPost.comments.push(comment);
            await targetPost.save();
            const updatedPost = await this.postService.updatepost(targetPost, id);
            res.status(201).json({ message: "Comment Added", updatedPost });

        }
    }

    @Delete('deletecomment/:id/:commentid')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async deleteComment(@Param('id') id: string, @Param('commentid') commentid: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })

        if (commentIndex === -1) {
            res.status(404).json({ error: 'Comment not found' });
        } else {
            targetPost.comments.splice(commentIndex, 1);
            await targetPost.save();
            res.status(200).json({ message: 'Comment deleted', updatedPost: targetPost });
        }

    }


    @Get('getcomments/:id')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'Get comments for a post' })
    @ApiParam({ name: 'postid', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async getComments(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        res.status(200).json(targetPost.comments);

    }

    @Patch('reactcomment/:id/:commentid/:userid')
    @UseGuards(PostExistGuard)
    @ApiOperation({ summary: 'React to a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiParam({ name: 'userid', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Comment liked' })
    @ApiResponse({ status: 200, description: 'Comment unliked' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async reactcomment(@Param('id') id: string, @Param('userid') userid: string, @Param('commentid') commentid: string, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        if (targetPost instanceof Error) {
            res.status(400).json(targetPost.message);
        } else {
            const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })
            if (commentIndex === -1) {
                res.status(404).json({ error: 'Comment not found' });
            } else {
                const userIndex = targetPost.comments[commentIndex].likes.persons.findIndex((userId: string) => { return userId === userid; })
                if (userIndex === -1) {
                    targetPost.comments[commentIndex].likes.persons.push(userid);
                    targetPost.comments[commentIndex].likes.number += 1;
                    const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
                    res.status(200).json({ message: 'Comment liked', updatedPost: updatedPost });
                } else {
                    targetPost.comments[commentIndex].likes.persons.splice(userIndex, 1);
                    targetPost.comments[commentIndex].likes.number -= 1;
                    const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
                    res.status(200).json({ message: 'Comment unliked', updatedPost: updatedPost });
                }

            }
        }
    }


    @Patch('updatecomment/:id/:commentid')
    @UseGuards(PostExistGuard)
    @UseGuards(CommentUpdateValidationGuard)
    @ApiOperation({ summary: 'Update a comment' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiParam({ name: 'commentid', description: 'Comment ID' })
    @ApiBody({ type: CommentUpdates })
    @ApiResponse({ status: 200, description: 'Comment updated' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async updatecomment(@Param('id') id: string, @Param('commentid') commentid: string, @Body() req: CommentUpdates, @Res() res: Response): Promise<void> {
        const targetPost = await this.postService.findOne(id);
        const commentIndex = targetPost.comments.findIndex((comment: Comment) => { return comment._id.toString() === commentid; })
        if (commentIndex === -1) {
            res.status(404).json({ error: 'Comment not found' });
        } else {
            targetPost.comments[commentIndex].text = req.text;
            const updatedPost = await this.postService.updatepost(targetPost, targetPost._id.toString());
            res.status(200).json({ message: 'Comment updated', updatedPost: updatedPost });
        }

    }



}