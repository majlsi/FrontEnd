import { BaseModel } from './baseModel';

export class AgendaTemplate extends BaseModel {
    id: number;
    agenda_template_name_en: string;
    agenda_template_name_ar: string;
    organization_id: number;
    agenda_description_template_en: string;
    agenda_description_template_ar: string;
}
