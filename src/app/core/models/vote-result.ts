
import { BaseModel } from './baseModel';

export class VoteResult extends BaseModel {
	id: number;
	vote_status_id: number;
	user_id: number;
	meeting_id: number;
	vote_id: number;
	image_url: string;
	user_title_ar: string;
	user_title_en: string;
	name: string;
	name_ar: string;
	vote_status_name_ar: string;
	vote_status_name_en: string;
	organization_image_url: string;
}
