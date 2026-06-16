import { Controller,Post,Get,Param,Body } from '@nestjs/common';
import { VirtualCardService } from './virtual.card.service';

@Controller('virtual-card')
export class VirtualCardController {
    constructor( private readonly virtualCardService: VirtualCardService){}

    @Post('create-main')
        createMain(
            @Body() dataDto:{
                fullName:string,
                pan:string,
                accountNumber:number
                id:string,
            }
        ){
            return this.virtualCardService.createMainCard(dataDto.fullName,dataDto.pan,dataDto.accountNumber,dataDto.id)
        }

    @Post('create-temp')
        createTemp(
            @Body() dataDto:{
                fullName:string,
                expiryTime:string,
                id:string,
                accountNumber:number,
                expiry:string,
                accountUsers:string[]
            }
        ){
            return this.virtualCardService.createTempCard(dataDto.fullName,dataDto.expiryTime,dataDto.id,dataDto.accountNumber,dataDto.accountUsers,dataDto.expiry)
        }

    

    @Post('generate-qr-code')
        getQRCode(
            @Body() dataDto:{
                cardId:string;
            }
        ){
            return this.virtualCardService.cardQRCode(dataDto.cardId)
        }


    @Get('card/:id')
        getVirtualCard(@Param('id') id: string) {
            return this.virtualCardService.getVirtualCard(id);
        }

    @Get('account/:accountNumber')
        getVirtualCards(@Param('accountNumber') accountNumber: string) {
            return this.virtualCardService.getVirtualCards(Number(accountNumber));
        }
}
