import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReceivedContractDto {
    @IsString()
    @IsNotEmpty()
    contractId: string;

    @IsString()
    @IsNotEmpty()
    receiverUsername: string;

    @IsBoolean()
    accepted: boolean;
}
