import { BaseModel } from './baseModel';

export class Nickname extends BaseModel {
    id: number;
    nickname_ar: string;
    nickname_en: string;
	organization_id: number;

}
