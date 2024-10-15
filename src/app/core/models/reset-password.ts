import { BaseModel } from './baseModel';

export class ResetPassword extends BaseModel {
    password: string;
    password_confirmation: string;
    token: string;

}


