import { BaseModel } from './baseModel';

export class MeetingType extends BaseModel {
    id: number;
    meeting_type_name_ar: string;
    meeting_type_name_en: string;
	is_system: boolean;
	meeting_type_code: string;
}
