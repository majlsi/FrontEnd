import { BaseModel } from './baseModel';

export class UserSignature extends BaseModel {
	UserSignatureID: number;
	UserID: number;
    SignatureValue: string;
}


