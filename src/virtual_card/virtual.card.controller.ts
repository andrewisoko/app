import { Controller,Post,Body } from '@nestjs/common';
import { VirtualCardService } from './virtual.card.service';

@Controller('virtual-card')
export class VirtualCardController {
    constructor( private readonly virtualCardService: VirtualCardService){}

    @Post('create-main')
        createMain(
            @Body() fullName: string
        ){
            return this.virtualCardService.createMainCard(fullName)
        }

    @Post('create-temp')
        createTemp(
            @Body() dataDto:{
                fullName:string,
                expiryTime:string,
            }
        ){
            return this.virtualCardService.createTempCard(dataDto.fullName,dataDto.expiryTime)
        }
}
