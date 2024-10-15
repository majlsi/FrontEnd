import { BaseModel } from './baseModel';

export class DecisionType extends BaseModel {
    id: number;
    decision_type_name_ar: string;
    decision_type_name_en: string;
    organization_id: number;
}
