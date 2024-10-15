import { BaseModel } from './baseModel';

export class FaqSection extends BaseModel {
    id: number;
    faq_section_name_ar: string;
    faq_section_name_en: string;
	parent_section_id: number;
	hasChilds:boolean;
	is_active: boolean;

}
