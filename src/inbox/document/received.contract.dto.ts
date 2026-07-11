import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class ReceivedContractDto {
    @IsString()
    @IsNotEmpty()
    contractId: string;

    @IsString()
    @IsNotEmpty()
    receiverAccountId: string;

    @IsBoolean()
    decision: boolean;

    @IsString()
    @IsOptional()
    defaultUserId?: string;
}
