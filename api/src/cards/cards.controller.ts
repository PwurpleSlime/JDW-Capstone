import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('/items')
  @ApiOperation({ summary: 'Get all card items grouped by card number' })
  @ApiResponse({ status: 200, description: 'Returns card items with link and paragraph arrays' })
  getAllCardItems() {
    return this.cardsService.getAllCardItems();
  }

  @Get('/getCardByNumber/:id')
  @ApiOperation({ summary: 'Get card by card number' })
  @ApiParam({ name: 'id', type: 'number', description: 'The card number to search for' })
  @ApiResponse({ status: 200, description: 'Returns array of card content' })
  getCardByNumber(@Param('id') id: string) {
    return this.cardsService.getCardByNumber(Number(id));
  }
}
