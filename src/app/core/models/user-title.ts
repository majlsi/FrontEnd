import { BaseModel } from './baseModel';

export class UserTitle extends BaseModel {
    id: number;
    user_title_name_ar: string;
    user_title_name_en: string;
	organization_id: number;

}
