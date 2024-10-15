import { BaseModel } from './baseModel';

export class MeetingRecommendation extends BaseModel {
    id: number;
    recommendation_text: string;
    recommendation_date: any;
	responsible_user: string;
	responsible_party: string;
	meeting_id: number;
    recommendation_status_id: number;
    recommendationDateModel: any;
}
