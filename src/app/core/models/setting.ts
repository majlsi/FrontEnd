import { BaseModel } from './baseModel';

export class Setting extends BaseModel {
    id: number;
    setting_key: string;
    setting_key_ar: string;
    setting_value: string;
    setting_unit: string;
}


