import { Organization } from './organization';
import { User } from './user';

import { BaseModel } from './baseModel';
import { Image } from './image';

export class MeetingParticipant extends BaseModel {
	id: number;
    user_id: number;
	meeting_id: number;
	meeting_role_id: number;
	participant_order: number;
	meeting_attendance_status_id: number;
	meeting_attendance_status_name_ar: string;
	meeting_attendance_status_name_en: string;
	color_class_name: string;
	name_ar: string;
	name: string;
	user_title_en: string;
	user_title_ar: string;
	job_title_en: string;
	job_title_ar: string;
	nickname_ar: string;
	nickname_en: string;
	email: string;
	organization: Organization;
	image: Image;
	pivot: any;
}
