import { Module } from '@nestjs/common';
import { UserOperationsController } from './user.operations.controller';
import { User, UserSchema } from '../../model/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../user-auth/user.service';
import { UserModule } from '../user-auth/user.module';
import { UserOperationsService } from './user.operations.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule
  ],
  providers: [UserService, UserOperationsService],
  controllers: [UserOperationsController]
})
export class UserOperationsModule { }
