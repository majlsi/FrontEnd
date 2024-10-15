import { BaseModel } from './baseModel';

export class Image extends BaseModel {
    id: number;
    original_image_url: string;
    image_url: string;
}
