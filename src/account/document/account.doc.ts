import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export enum ACCOUNT_STATUS {
    ACTIVE = "active",
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended',
    CLOSE = 'Closed',
    PENDING = 'Pending',
}

@Schema({ timestamps: true })
export class Account extends Document {

    
    @Prop({ type: Number, default: 12345678 })
    accountNumber: number;

    @Prop({ type: Number, default: 0 })
    balance: number;

    @Prop({ type: String, maxlength: 3, default: 'GBP' })
    currency: string;

    @Prop({
        type: String,
        enum: ACCOUNT_STATUS,
        default: ACCOUNT_STATUS.PENDING,
    })
    status: ACCOUNT_STATUS;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export type AccountDocument = HydratedDocument<Account>;
export const AccountSchema = SchemaFactory.createForClass(Account);