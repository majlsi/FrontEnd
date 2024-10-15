import { BaseModel } from './baseModel';
import { ZoomConfiguration } from './zoom-configuration';
import { MicrosoftTeamConfiguration } from './microsoft-team-configuration';

export class UserOnlineConfiguration extends BaseModel {
    id: number;
    configuration_name_ar: string;
    configuration_name_en: string;
    user_id: number;
    is_active: boolean;
    zoom_configuration_id: number;
    microsoft_configuration_id: number;
    zoom_configuration: ZoomConfiguration;
    microsoft_team_configuration: MicrosoftTeamConfiguration;
    online_meeting_app_id: number;
}
