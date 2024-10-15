import { BaseModel } from './baseModel';

export class ZoomConfiguration extends BaseModel {
    id: number;
    organization_id: number;
    zoom_api_key: string;
    zoom_api_secret: string;
    zoom_host_video: boolean;
    zoom_participant_video: boolean;
    zoom_join_before_host: boolean;
    zoom_mute_upon_entry: boolean;
    zoom_water_mark: boolean;
    zoom_audio: string;
    zoom_approval_type: number;
    zoom_auto_recording: string
    zoom_meeting_authentication: boolean;
    zoom_registrants_email_notification: boolean;
    zoom_use_pmi: boolean;
}
