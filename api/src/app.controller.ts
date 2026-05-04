import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { getGoogleSheet } from './utilites/spreadsheet';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('getSpreadsheet')
  getEntireSpreadsheet(){
    return getGoogleSheet(0)
  }
}
