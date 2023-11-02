import { Controller, Get, Post, Body, Res, Req, UseGuards, Patch, Param ,UseInterceptors, UploadedFile  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiOkResponse,ApiConflictResponse, ApiResponse } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express/multer';
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
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' }) 
  @ApiResponse({ status: 409, description: 'Email already exists' }) 
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @Body() req:User, @Res() res: Response,
    @UploadedFile() profilePicture?): Promise<void> {
    const userExist = await this.userService.findUser(req.email);
    if (userExist instanceof Error) {
      const newUser = await this.userService.create(req);
      newUser.profilePicture = await this.firebaseService.uploadImageToFirebase(profilePicture ,newUser._id ,'profilePicture')
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
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Update a user' })
  async updateUser(@Body() user: UserUpdates, @Param('id') id: string, @Res() res: Response): Promise<void> {
    if (user.password) {
      user.password = await PasswordValidator.hashPassword(user.password)
    }
    if (user.email) {
      const otpData = this.otpService.generateOTP()
      this.mailerService.sendOtpEmail(user.email, otpData.otp);
      user.otp = otpData.otp
      user.isVerified = false
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

}




