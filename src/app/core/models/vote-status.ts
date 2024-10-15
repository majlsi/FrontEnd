import { BaseModel } from './baseModel';

export class VoteStatus extends BaseModel {
    id: number;
    vote_status_name_ar: string;
	vote_status_name_en: string;
	color_class_name: string;
	icon_class_name: string;
}
