import { BaseModel } from "./baseModel";

export class Stakeholder extends BaseModel {
    id: number;
    name: string;
    name_ar: string;
    password: string;
    rpassword: string;
    email: string;
    user_phone: string;
    is_active: boolean;
    date_of_birth: string;
    identity_number: string;
    share: number;
    role_id: number;
    language_id: number;
}