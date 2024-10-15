import { BaseModel } from './baseModel';

export class Reminder extends BaseModel {
	id: number;
    reminder_description_en: string;
	reminder_description_ar: string;
	reminder_duration_in_minutes: number;
}


