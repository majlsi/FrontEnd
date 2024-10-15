
import { BaseModel } from './baseModel';
import { VideoIcon } from './video-icon';

export class VideoGuide extends BaseModel {
	id: number;
	video_name_ar: string;
	video_name_en: string;
	video_description_ar: string;
	video_description_en: string;
	video_url: string;
	video_icon_id: number;
    video_order: number;
	video_icon: VideoIcon;
	tutorial_step_tag:  string;
	tutorial_step: any;
}
