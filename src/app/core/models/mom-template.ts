
import { BaseModel } from './baseModel';
import { Image } from './image';

export class MomTemplate extends BaseModel {
    id: number;
    is_default: boolean;
    template_name_en: string;
    template_name_ar: string;
    organization_id: number;
    show_mom_header: boolean;
    show_agenda_list: boolean;
    show_timer: boolean;
    show_presenters: boolean;
    show_recommendation: boolean;
    show_purpose: boolean;
    show_participant_nickname: boolean;
    show_participant_job: boolean;
    show_participant_title: boolean;
    show_conclusion: boolean;
    show_vote_results: boolean;
    show_vote_status: boolean;
    conclusion_template_en: string;
    conclusion_template_ar: string;
    member_list_introduction_template_en: string;
    member_list_introduction_template_ar: string;
    introduction_template_en: string;
    introduction_template_ar: string;
    logo_image: Image;
    logo_id: number;

}
