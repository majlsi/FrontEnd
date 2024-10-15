import {BaseModel} from './baseModel';
import {Organization} from './organization';
import {Image} from './image';

export class User extends BaseModel {
	id: number;
	meeting_guest_id?: number;
	name: string;
	name_ar: string;
	password: string;
	rpassword: string;
	email: string;
	username: string;
	role_id: number;
	organization: Organization;
	is_selected: boolean;
	is_active: boolean;
	is_head: boolean = false;
	is_organiser: boolean = false;
	image_url: string;
	profile_image: Image;
	image: Image;
	profile_image_id: number;
	user_phone: string;
	main_page_id: number;
	user_title_id: number;
	job_title_id: number;
	nickname_id: number;
	can_sign: boolean;
	send_mom: boolean;
	language_id: number;
	user_title_en: string;
	user_title_ar: string;
	job_title_ar: string;
	job_title_en: string;
	nickname_ar: string;
	nickname_en: string;
	chat_user_id: number;
	meeting_attendance_status_id: number;
	committee_user_start_date: any;
	committee_user_expired_date: any;
	disclosure_url: string;
	isGuest?: boolean;
	evidence_document_url: string;
	responsible_administration: string;
	transfer_no: number;
	is_blocked: boolean;
	block_reason: string;
	block_file: string;
	evaluation_id: number;
	evaluation_name_en: string;
	evaluation_name_ar: string;
	evaluation_reason: string;
	committee_user_id: number;
	is_conflict: boolean;

	job_id: string;
	job_title: string;
	hr_categoryName: string;
	hr_gradeName: string;
	areaName: string;
	metadata?: any;
}


