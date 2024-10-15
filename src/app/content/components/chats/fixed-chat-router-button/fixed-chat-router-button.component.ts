import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Meeting } from '../../../../core/models/meeting';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { environment } from '../../../../../environments/environment';
import { FilterObject } from '../../../../core/models/filter-object';
import { Router } from '@angular/router';

@Component({
  selector: 'm-fixed-chat-router-button',
  templateUrl: './fixed-chat-router-button.component.html',
  styleUrls: ['./fixed-chat-router-button.component.scss']
})
export class FixedChatRouterButtonComponent implements OnInit {

    @Input() meetingId: number;
    @Input() isArabic: boolean;
    meeting: Meeting = new Meeting();
    filterObject = new FilterObject();
  
    constructor(private _crudService: CrudService,
        private _chatService: ChatService,
        private router: Router) {}

    ngOnInit() {
        this.filterObject.PageNumber = 1;
        this.filterObject.SortBy = 'id';
        this.filterObject.SortDirection = 'DESC';
        this.filterObject.SearchObject = {};
        this.filterObject.PageSize = environment.pageSize;
        this.getMeeting();
    }

    getMeeting(){
        this._crudService.get<Meeting>('admin/meetings',this.meetingId).subscribe(res => {
            this.meeting = res;
        }, error => {
        });
    }

    createChat(){
        this._chatService.createMeetingChat(this.meetingId,this.filterObject).subscribe(res => {
            this.router.navigate(['/conversations/chats'],{ queryParams: { chatGroupId: res.chatGroup.id } });
        }, error => {
        });
    }
}
