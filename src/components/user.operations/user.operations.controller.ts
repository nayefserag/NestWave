import { Controller, Delete, Get, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { UserOperationsService } from './user.operations.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ExistGuard } from 'src/guards/exist.guard';
import { UserService } from '../user-auth/user.service';
@ApiTags('User Operations')
@Controller('user.operations')
export class UserOperationsController {
    constructor(
        private readonly userOperationsService: UserOperationsService,
        private readonly userService: UserService,) { }

    @Delete('/deleteprofile/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiOperation({ summary: 'Delete a user profile' })
    @ApiParam({ name: 'id', description: 'Profile ID to delete' })
    async deleteprofile(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.delete(id);
        res.status(200).json(user);
    }


    @Patch('/follow/:currentuser/:followeduser')
    @ApiOperation({ summary: 'Follow a user' })
    @ApiParam({ name: 'currentuser', description: 'Current user' })
    @ApiParam({ name: 'followeduser', description: 'User to follow' })
    async follow(@Param('currentuser') currentuser: string, @Param('followeduser') followeduser: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.follow(currentuser, followeduser);
        if (user instanceof Error) {
            res.status(404).json(user.message);
        }
        else {
            res.status(200).json(user);
        }
    }

    @Get('/getfollowers/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiOperation({ summary: 'Get followers of a user' })
    @ApiParam({ name: 'id', description: 'User to get followers for' })
    async getfollowers(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowers(id);
        if (Array.isArray(user) && user.length === 0) {
            {
                res.status(200).json("No followers");
            }
        }
        else {
            res.status(200).json(user);
        }
    }


    @Get('/getfollowings/:id')
    @UseGuards(ExistGuard(UserService))
    @ApiOperation({ summary: 'Get followings of a user' })
    @ApiParam({ name: 'id', description: 'User to get followings for' })
    async getfollowings(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowings(id);
        if (Array.isArray(user) && user.length === 0) {
            {
                res.status(200).json("No followings");
            }
        }
        else {
            res.status(200).json(user);
        }
    }



}
