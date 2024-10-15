import { BaseModel } from './baseModel';

export class Configration extends BaseModel {
    id: number;
    introduction_video_url: string;
    support_email: string;
    mjlsi_system_before_meeting_video_url: string;
    explain_create_meeting_video_url: string;
	manage_board_meeting_video_url: string;
    manage_board_meeting_extra_video_url: string;
    introduction_arabic_pdf_url: string;
    introduction_english_pdf_url: string;
    third_pdf_url: string;
}
