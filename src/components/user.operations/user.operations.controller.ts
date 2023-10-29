import { Controller, Delete, Get, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { UserOperationsService } from './user.operations.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExistGuard } from 'src/guards/exist.guard';
import { UserService } from '../user-auth/user.service';
@ApiTags('User Operations')
@Controller('user.operations')
export class UserOperationsController {
    constructor(
        private readonly userOperationsService: UserOperationsService,
    ) { }

    @Delete('/deleteprofile/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiOperation({ summary: 'Delete a user profile' })
    @ApiParam({ name: 'id', description: 'Profile ID to delete' })
    @ApiResponse({ status: 200, description: 'User profile deleted successfully' }) 
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteprofile(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.delete(id);
        res.status(200).json({message : "User Deleted", statusCode: 200});
    }


    @Patch('/follow/:currentuser/:followeduser')
    @ApiOperation({ summary: 'Follow a user' })
    @ApiParam({ name: 'currentuser', description: 'Current user' })
    @ApiParam({ name: 'followeduser', description: 'User to follow' })
    @ApiResponse({ status: 200, description: 'User followed successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async follow(@Param('currentuser') currentuser: string, @Param('followeduser') followeduser: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.follow(currentuser, followeduser);
        if (user instanceof Error) {
            res.status(400).json({message : user.message , statusCode: 400});
        }
        else {
            res.status(200).json({message:user , statusCode: 200});
        }
    }

    @Get('/getfollowers/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiParam({ name: 'id', description: 'User to get followers for' })
    @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No followers found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiOperation({ summary: 'Get followers of a user' })
    async getfollowers(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowers(id);
        if (Array.isArray(user) && user.length === 0) {
            {
                res.status(200).json({message : "No followers" , statusCode: 200});
            }
        }
        else {
            res.status(404).json({message :user, statusCode: 404});
        }
    }


    @Get('/getfollowings/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiParam({ name: 'id', description: 'User to get followings for' })
    @ApiResponse({ status: 200, description: 'Followings retrieved successfully' }) 
    @ApiResponse({ status: 404, description: 'No followings found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiOperation({ summary: 'Get followings of a user' })
    
    async getfollowings(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowings(id);
        if (Array.isArray(user) && user.length === 0) {
            {
                res.status(200).json({message :"No followings" , statusCode: 200});
            }
        }
        else {
            res.status(404).json({message :user, statusCode: 404});
        }
    }



}
