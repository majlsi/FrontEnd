import { BaseModel } from './baseModel';
import { User } from './user';
import { Image } from './image';

export class ChatGroup extends BaseModel {
    id: number;
    committee_id: number;
    meeting_id: number;
    chat_group_logo_id: number;
    organization_id: number;
    member_users: Array<User> = [];
	creator_id: number;
	chat_group_name_en: string;
    chat_group_name_ar: string;
    chat_room_id: number;
    last_message_text: string;
    last_message_date: any;
    is_group_chat: boolean;
    organization_logo_url: string;
    chat_group_logo_url: string;
    is_selected: boolean;
    chat_group_logo: Image;
    markUnread:boolean;
}