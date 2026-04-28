import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';


export class ReceivedContractDto {
    @IsString()
    @IsNotEmpty()
    contractId: string;

    @IsString()
    @IsNotEmpty()
    receiverIds: string;

    @IsBoolean()
    accepted: boolean;
}
