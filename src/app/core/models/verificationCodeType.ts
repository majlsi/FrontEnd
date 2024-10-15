import { BaseModel } from "./baseModel";

export class VerificationCodeType extends BaseModel{
	SendEmail: boolean;
	SendSms: boolean;
}
