import { Controller, Get ,Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express'; 
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    const newUser =  this.appService.getHello();
    res.status(201).json(newUser);
  }
}
