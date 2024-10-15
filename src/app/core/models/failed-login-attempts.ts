import { BaseModel } from './baseModel';

export class FailedLoginAttempt extends BaseModel {
    id: number;
    email_address: string;
    ip_address: string;
    failed_login_date: Date;
	user_id: number;
}
