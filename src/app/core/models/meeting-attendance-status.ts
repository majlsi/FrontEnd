import { BaseModel } from './baseModel';

export class MeetingAttendanceStatus extends BaseModel {
    id: number;
    meeting_attendance_status_name_ar: string;
	meeting_attendance_status_name_en: string;
	color_class_name: string;
	icon_class_name: string;
	meeting_attendance_action_name_en: string;
	meeting_attendance_action_name_ar: string;
}
