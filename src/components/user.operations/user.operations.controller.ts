import { Controller, Delete, Get, Param, Patch, Res } from '@nestjs/common';
import { UserOperationsService } from './user.operations.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
@ApiTags('User Operations')
@Controller('user.operations')
export class UserOperationsController {
    constructor(private readonly userOperationsService: UserOperationsService) { }



    @Delete('/deleteprofile/:profileid')
    @ApiOperation({ summary: 'Delete a user profile' })
    @ApiParam({ name: 'profileid', description: 'Profile ID to delete' })
    async deleteprofile(@Param('profileid') profileid: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.delete(profileid);
        if (user instanceof Error) {
            res.status(404).json(user.message);
        }
        else {
            res.status(200).json(user);
        }
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

    @Get('/getfollowers/:currentuser')
    @ApiOperation({ summary: 'Get followers of a user' })
    @ApiParam({ name: 'currentuser', description: 'User to get followers for' })
    async getfollowers(@Param('currentuser') currentuser: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowers(currentuser);
        if (user instanceof Error) {
            res.status(404).json(user.message);
        }
        else if (user.length == 0) {
            {
                res.status(200).json("No followers");
            }
        }
        else {
            res.status(200).json(user);
        }
    }


    @Get('/getfollowings/:currentuser')
    @ApiOperation({ summary: 'Get followings of a user' })
    @ApiParam({ name: 'currentuser', description: 'User to get followings for' })
    async getfollowings(@Param('currentuser') currentuser: string, @Res() res: Response): Promise<void> {
        const user = await this.userOperationsService.getfollowings(currentuser);
        if (user instanceof Error) {
            res.status(404).json(user.message);
        }
        else if (user.length == 0) {
            {
                res.status(200).json("No followings");
            }
        }
        else {
            res.status(200).json(user);
        }
    }



}
