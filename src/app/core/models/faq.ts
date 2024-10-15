import { BaseModel } from './baseModel';

export class Faq extends BaseModel {
    id: number;
	faq_question_ar: string;
    faq_question_en: string;
    faq_answer_ar: string;
    faq_answer_en: string;
	section_id: number;
	section_name_ar: string;
	section_name_en: string;
	is_active: boolean;



}
