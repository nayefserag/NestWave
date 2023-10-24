import { Injectable, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../model/user.model';
import { UserService } from '../user-auth/user.service';

@Injectable()
export class UserOperationsService {
    constructor(private readonly userService: UserService) { }
    async delete(id: string): Promise<string | Error> {
        const user = await this.userService.deleteUser(id);
        if (user instanceof Error) {
            return new Error('User Not Found');
        }
        else {
            return "Profile Deleted"
        }
    }

    async follow(currentuser: string, followeduser: string): Promise<string | Error> {
        if (currentuser == followeduser) {
            return new Error('You cannot follow yourself');
        }
        const user = await this.userService.findUserById(currentuser);
        const targetUser = await this.userService.findUserById(followeduser);
        if (user instanceof Error) {
            return new Error('User Not Found');
        }
        else if (targetUser instanceof Error) {
            return new Error('You Cannot Follow User Cause User Not Found');
        }
        else {
            if (!targetUser.followers.includes(currentuser) || targetUser.followers === null) {
                await targetUser.updateOne({
                    $push: {
                        followers: user._id
                    }
                });
                await user.updateOne({
                    $push: {
                        followings: targetUser._id
                    }
                });
                return "Followed"
            }
            else {
                await targetUser.updateOne({
                    $pull: {
                        followers: user._id
                    }
                })
                await user.updateOne({
                    $pull: {
                        followings: targetUser._id
                    }
                })
                return "Unfollowed"
            }

        }



    }

    async getfollowers(currentuser: string): Promise<string[] | Error> {
        const user = await this.userService.findUserById(currentuser);
        if (user instanceof Error) {
            return new Error('User Not Found');
        }
        else {
            return user.followers;
        }
    }

    async getfollowings(currentuser: string): Promise<string[] | Error> {
        const user = await this.userService.findUserById(currentuser);
        if (user instanceof Error) {
            return new Error('User Not Found');
        }
        else {
            return user.followings;
        }
    }
}





