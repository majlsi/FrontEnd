import { BaseModel } from './baseModel';
import { Image } from './image';
import { ZoomConfiguration } from './zoom-configuration';
import { MicrosoftTeamConfiguration } from './microsoft-team-configuration';

export class Organization extends BaseModel {
    id: number;
    organization_name_en: string;
    organization_name_ar: string;
    organization_phone: string;
    organization_number_of_users: number;
    logo_image: Image;
    is_active: boolean;
    is_selected: boolean;
    organization_code: string;
    expiry_date_from: string;
    expiry_date_to: string;
    licenseDuration: number;
    time_zone_id: number;
    organization_type_id: number;
    api_url: string;
    front_url: string;
    redis_url: string;
    is_vote_enabled: boolean;
    has_two_factor_auth: boolean;
    is_zoom_enabled: boolean;
    is_microsoft_teams_enabled: boolean;
    disclosure_url: string;
    directory_quota: number;
    enable_meeting_archiving: boolean;
    is_stakeholder_enabled: boolean;
    stakeholders_count: number;
}


