import { BaseModel } from './baseModel';

export class DocumentAnnotation extends BaseModel {
    id: number;
    document_user_id: number;
    page_number: number;
    annotation_text: string;
    x_upper_left: number;
    y_upper_left: number;
    creation_date: any;
    can_edit: boolean;
    name: string;
    name_ar: string;
    user_id:  number;
    image_url : string;
    color_code: string;
}
