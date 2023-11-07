import { Body, Controller, Delete, Get, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { UserOperationsService } from './user.operations.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExistGuard } from 'src/guards/exist.guard';
import { UserService } from '../user-auth/user.service';
import { FirebaseService } from 'src/service/firebase/firebase.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('User Operations')
@Controller('user.operations')
export class UserOperationsController {
    constructor(
        private readonly userOperationsService: UserOperationsService,
        private readonly firebaseService: FirebaseService,
        private readonly userService: UserService
    ) { }


    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'User profile fetched successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getprofile(@Body() req: any, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getprofile(req.email);
        if (user instanceof Error) {
            res.status(404).json({ message: user.message, statusCode: 404 });
        }
        else {
            
            res.status(200).json(user);
        }
    }

    @Delete('/deleteprofile/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiOperation({ summary: 'Delete a user profile' })
    @ApiParam({ name: 'id', description: 'Profile ID to delete' })
    @ApiResponse({ status: 200, description: 'User profile deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteprofile(
        @Param('id') id: string, 
        @Res() res: Response,
        @I18n() i18n: I18nContext): Promise<void> {
        const user = await this.userOperationsService.delete(id);
        res.status(200).json({ message: i18n.t('content.USER_DELETED_SUCCESSFULLY'), statusCode: 200 });
    }


    @Patch('/follow/:currentuser/:followeduser')
    @ApiOperation({ summary: 'Follow a user' })
    @ApiParam({ name: 'currentuser', description: 'Current user' })
    @ApiParam({ name: 'followeduser', description: 'User to follow' })
    @ApiResponse({ status: 200, description: 'User followed successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async follow(
        @Param('currentuser') currentuser: string, 
        @Param('followeduser') followeduser: string, 
        @Res() res: Response,
        @I18n() i18n: I18nContext): Promise<void> {
        const user = await this.userOperationsService.follow(currentuser, followeduser);
        if (user instanceof Error) {
            res.status(400).json({ message: user.message, statusCode: 400 });
        }
        else {
            const notifiedUser = await this.userService.findByid(followeduser);
            const notification = await this.firebaseService.sendNotification(notifiedUser.fcmToken, "New Follower", `User followed you`);
            console.log("notification:", notification);
            res.status(200).json({ message: i18n.t('content.USER_FOLLOWED'), statusCode: 200 });
        }
    }

    @Get('/getfollowers/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiParam({ name: 'id', description: 'User to get followers for' })
    @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No followers found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiOperation({ summary: 'Get followers of a user' })
    async getfollowers(
        @Param('id') id: string, 
        @Res() res: Response,
        @I18n() i18n: I18nContext): Promise<void> {
        const users = await this.userOperationsService.getfollowers(id);
        if (Array.isArray(users) && users.length === 0) {
            {
                res.status(200).json({ message: i18n.t('content.NO_FOLLOWERS_FOUND'), statusCode: 200 });
            }
        }
        else {
            res.status(404).json({ message: users, statusCode: 404 });
        }
    }


    @Get('/getfollowings/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiParam({ name: 'id', description: 'User to get followings for' })
    @ApiResponse({ status: 200, description: 'Followings retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No followings found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiOperation({ summary: 'Get followings of a user' })

    async getfollowings(
        @Param('id') id: string, 
        @Res() res: Response,
        @I18n() i18n: I18nContext): Promise<void> {
        const user = await this.userOperationsService.getfollowings(id);
        if (Array.isArray(user) && user.length === 0) {
            {
                res.status(200).json({ message: i18n.t('content.NO_FOLLOWINGS_FOUND'), statusCode: 200 });
            }
        }
        else {
            res.status(404).json({ message: user, statusCode: 404 });
        }
    }



}
