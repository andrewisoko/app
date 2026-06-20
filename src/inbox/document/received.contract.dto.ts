import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class ReceivedContractDto {
    @IsString()
    @IsNotEmpty()
    contractId: string;

    @IsString()
    @IsNotEmpty()
    receiverAccountIds: string;

    @IsBoolean()
    accepted: boolean;

    @IsString()
    @IsOptional()
    defaultUserId?: string;
}
