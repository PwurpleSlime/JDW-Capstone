import { Injectable } from '@nestjs/common';
import { getGoogleSheet } from '../utilites/spreadsheet';

export interface CardItem {
  link: string;
  paragraph: string[];
}

@Injectable()
export class CardsService {
  async getAllCards() {
    return await getGoogleSheet(0);
  }

  async getAllCardItems(): Promise<CardItem[]> {
    const spreadsheetJSON = await getGoogleSheet(0);
    if (!spreadsheetJSON || spreadsheetJSON.length === 0) throw 'Failed to get spreadsheet';

    const firstRow = spreadsheetJSON[0];
    const cardKeys = Object.keys(firstRow)
      .filter((key) => /^Card \d+$/.test(key))
      .sort((a, b) => Number(a.replace('Card ', '')) - Number(b.replace('Card ', '')));

    return cardKeys.map((cardKey) => ({
      link: firstRow[cardKey] as string,
      paragraph: spreadsheetJSON
        .slice(1)
        .map((row) => row[cardKey])
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    }));
  }

  async getCardByNumber(cardNumber: Number) {
    const spreadsheetJSON = await getGoogleSheet(0);
    if (!spreadsheetJSON) throw 'Failed to get spreadsheet';

    const cardKey = `Card ${cardNumber}`;
    const results: any[] = [];

    for (let i = 0; i < spreadsheetJSON.length; i++) {
      if (cardKey in spreadsheetJSON[i]) {
        results.push(spreadsheetJSON[i][cardKey]);
      }
    }

    return results;
  }
}
