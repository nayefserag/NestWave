import { Controller, Get, Post, Body, Res, Req, UseGuards, Patch, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse ,ApiParam} from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from '../../model/user.model';
import { UserValidator } from '../../Validators/user.validator';
import { PasswordValidator } from '../../middlewares/password.validator';
import { MailerService } from '../../service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { UserUpdates } from 'src/dtos/update-user.dto';
import { OtpService } from 'src/service/otp/otp.service';
import { AuthGuard } from '@nestjs/passport';
import { ExistGuard } from 'src/guards/exist.guard';
import { ValidationGuard } from 'src/guards/validator.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { FirebaseService } from 'src/service/firebase/firebase.service';
@Controller('users')
@ApiTags('User Controller')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly firebaseService: FirebaseService
  ) { }

  @Post('/newuser')
  // @UseGuards(new ValidationGuard({ validator: UserValidator, validatorupdate: false }))
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
  ]))
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' }) 
  @ApiResponse({ status: 409, description: 'Email already exists' }) 
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @Body() req:User,
    @Res() res: Response,
    @UploadedFiles() files: { profilePicture?: Express.Multer.File[], coverPicture?: Express.Multer.File[] }): Promise<void> {
    const userExist = await this.userService.findUser(req.email);
    if (userExist instanceof Error) {
      const newUser = await this.userService.create(req);
      if (files.profilePicture) {
        newUser.profilePicture = await this.firebaseService.uploadImageToFirebase(files.profilePicture[0], newUser._id, 'profilePicture');
      }
      if (files.coverPicture) {
        newUser.coverPicture = await this.firebaseService.uploadImageToFirebase(files.coverPicture[0], newUser._id, 'coverPicture');
      }
      const token = await this.jwtService.generateToken(newUser, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
      const refreshToken = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
      const otpData = this.otpService.generateOTP()
      newUser.otp = otpData.otp
      newUser.refreshToken = refreshToken
      await newUser.save()
      this.mailerService.sendOtpEmail(req.email, otpData.otp);


      res.header(process.env.JWT_TOKEN_NAME, token).status(201).json({
        message: `Welcome ${newUser.name} To My App  We Sent OTP To ${req.email} Please Verify Your Email ^_^`,
        newUser,
        token,
        refreshToken,

      });
    }
    else {
      res.status(409).json({message:"This Email Already Exist" ,statusCode : 409});

    }

  }


  @Post('/verifyotp')
  @UseGuards(ExistGuard(UserService))
  @ApiOperation({ summary: 'Verify OTP for a user' })
  @ApiResponse({ status: 200, description: 'User successfully verified' }) 
  @ApiResponse({ status: 400, description: 'Bad Request' }) 
  @ApiResponse({ status: 401, description: 'Unauthorized' }) 
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(@Body() req: { email: string, otp: string }, @Res() res: Response): Promise<void> {
    const { email, otp } = req;
    const user = await this.userService.findUser(email);
      if (otp === user.otp) {
        user.isVerified = true;
        const newUser = await this.userService.update(user);
        const newtoken = await this.jwtService.generateToken(newUser, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const newRefreshToke = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);

        await this.userService.updateToken(newUser._id, newRefreshToke);

        res.setHeader(process.env.REFRESH_TOKEN_NAME, newRefreshToke).setHeader(process.env.JWT_TOKEN_NAME, newtoken).status(200).json({message:"User successfully verified",statudCode : 200});
      } else {
        res.status(401).json({message:"Invalid OTP",statudCode : 401});
      }
  }


  @Get('/login')
  @UseGuards(ExistGuard(UserService))
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' }) 
  @ApiResponse({ status: 401, description: 'Unauthorized' }) 
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'User login' })
  async login(@Body() req: { email: string, password: string }, @Res() res: Response): Promise<void> {
    const user = await this.userService.findUser(req.email)
    if (user.password == undefined) {
      res.status(403).json("Try To Login With Google And Update Your Credentials")

    }
    else {
      const isMatch = await PasswordValidator.Match(req.password, user.password)
      if (isMatch) {
        const token = await this.jwtService.generateToken(user, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(user, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        user.refreshToken = refreshToken;
        await user.save()
        res.header(process.env.JWT_TOKEN_NAME, token).status(200).json({
          message: `Welcome To My App ${user.name} ^_^`,
          statusCode: 200,
          token,
        })
      }
      else {
        res.status(401).json({message:"Wrong Password Please Try Again :(" ,statusCode : 401});
      }
    }

  }



  @Get('/allusers')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 200, description: 'No users found' })
  async findAll(@Res() res: Response): Promise<void> {
    const users = await this.userService.findAll();
    if (users.length === 0) {
      res.status(200).json({ message: 'No users found' , statusCode : 200});
    } else {
      res.status(200).json({message:users , statusCode : 200});
    }
  }



  @Patch('/update/:id')
  @UseGuards(ExistGuard(UserService))
  @UseGuards(new ValidationGuard({ validator: UserValidator, validatorupdate: true }))
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
  ]))
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Update a user' })
  async updateUser(
    @Body() user: UserUpdates, 
    @Param('id') id: string, 
    @Res() res: Response,
    @UploadedFiles() files: { profilePicture?: Express.Multer.File[], coverPicture?: Express.Multer.File[] },
    ): Promise<void> {
    if (user.password) {
      user.password = await PasswordValidator.hashPassword(user.password)
    }
    if (user.email) {
      const otpData = this.otpService.generateOTP()
      this.mailerService.sendOtpEmail(user.email, otpData.otp);
      user.otp = otpData.otp
      user.isVerified = false
    }
    if (files.profilePicture) {
      user.profilePicture = await this.firebaseService.uploadImageToFirebase(files.profilePicture[0], id, 'profilePicture');
    }
    if (files.coverPicture) {
      user.coverPicture = await this.firebaseService.uploadImageToFirebase(files.coverPicture[0], id, 'coverPicture');
    }
    await this.userService.updateUser(user, id);

    res.status(200).json({message:"User Updated Successfully" , statusCode: 200});
  }


  @Get('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth() {
  }



  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication callback' })
  @ApiResponse({ status: 201, description: 'User registered or logged in successfully' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 302, description: 'Redirect to login page with an error' })
  @ApiOperation({ summary: 'Google authentication callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    if (user) {
      const userExist = await this.userService.findUser(user.email);
      if (userExist instanceof Error) {
        const newUser = await this.userService.create(user);
        const token = await this.jwtService.generateToken(newUser,process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.header(process.env.JWT_TOKEN_NAME, token).status(201).json({
          message: `Thanks ${newUser.name} To Register In My App ^_^`,
          statusCode: 201,
          newUser,
          token,
          refreshToken,

        })
      }
      else {
        const token = await this.jwtService.generateToken(userExist, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(userExist, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        userExist.refreshToken = refreshToken;
        await userExist.save();
        res.header(process.env.JWT_TOKEN_NAME, token).status(200).json({
          message: `Welcome Again ${user.name.firstName + ' ' + user.name.lastName} To My App ^_^`,
          statusCode: 200,
          user,
        });
      }
    }

    else {
      res.redirect('/login?error=google_login_failed');
    }
  }




  @Post('/request-reset')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiResponse({ status: 200, description: 'Password reset request sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestPasswordReset(@Body() req: { email: string }, @Res() res: Response): Promise<void> {
    const user = await this.userService.findUser(req.email);
    if (user instanceof Error) {
      res.status(404).json({ message: 'User not found' });
    }
    else {
      const resetcode = this.otpService.generateOTP()
      await this.mailerService.sendPasswordResetEmail(user.email, resetcode.otp);
      user.resetcode = resetcode.otp
      await user.save();
      res.status(200).json({ message: 'Password reset request sent successfully' });
    }
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset a password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() req: { email: string, password: string , resetcode : string}, @Res() res: Response): Promise<void> {
    const user = await this.userService.findUser(req.email);
    if (user instanceof Error) {
      res.status(404).json({ message: 'User not found' });
    }
    else if (user.resetcode != req.resetcode) {
      res.status(400).json({ message: 'Invalid reset code' });
    }
    else {
      user.password = await PasswordValidator.hashPassword(req.password);
      await user.save();
      res.status(200).json({ message: 'Password reset successful' });
    }
  }




  @Patch('/getFcmToken/:id')
  @UseGuards(ExistGuard(UserService))
  @ApiOperation({ summary: 'Get FCM Token' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'FCM Token updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFcmToken(@Param('id') id: string, @Body() req: { fcmToken: string }, @Res() res: Response): Promise<void> {
    const user = await this.userService.findByid(id);
      user.fcmToken = req.fcmToken;
      await user.save();
      res.status(200).json({ message: 'FCM Token updated successfully' });
  }

}




