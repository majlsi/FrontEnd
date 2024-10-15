import { BaseModel } from './baseModel';

export class TimeZone extends BaseModel {
    id: number;
    description_ar: string;
    description_en: string;
    is_system: boolean;
    diff_hours: number;
    time_zone_code: string;
}


