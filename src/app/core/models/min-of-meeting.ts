import { Attachment } from './attachment';

import { BaseModel } from './baseModel';

export class MinOfMeeting extends BaseModel {
    id: number;
	meeting_id: number;
	agenda_id: number;
	mom_title_ar: string;
	mom_title_en: string;
	mom_summary: string;
	attachments:  Array<Attachment>;
	files: Array<File>;
	momSummaryTempId: number;

}
