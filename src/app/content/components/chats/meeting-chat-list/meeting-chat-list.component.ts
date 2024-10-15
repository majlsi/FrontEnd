import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NewChatModalComponent } from "../new-chat-modal/new-chat-modal.component";
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { Meeting } from '../../../../core/models/meeting';
import { PagedResult } from '../../../../core/models/paged-result';
import { TranslationService } from '../../../../core/services/translation.service';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../core/services/security/users.service';
import { User } from '../../../../core/models/user';

@Component({
	selector: "m-meeting-chat-list",
	templateUrl: "./meeting-chat-list.component.html",
	styleUrls: ["./meeting-chat-list.component.scss"],
})
export class MeetingChatListComponent implements OnInit {

    filterObject = new FilterObject();
    historyFilterObject: any;
    meetings: Array<Meeting> = [];
    chatHistory: Array<any> = [];
    isArabic: boolean;
    chatNameAr: string;
    chatNameEn: string;
    membersNumber: number;
    environment = environment;
	@ViewChild('scrollMe') private myScrollContainer: ElementRef;
    scrollToBottom: boolean = true;
    totalRecords: number;
    selectedMeeting: Meeting = new Meeting();
    message: string = '';
    user: User;
    chatRoom: any;
    chatRoomsFilterObject = new FilterObject();
    committeesList: Array<any> = [];
    meetingsList: Array<any> = [];
    submitedStartConvensation: boolean = false;
    meetingId: number;
    isCollapsed: boolean = false;
    submitMessage: boolean = false;

    constructor(private router: Router,
        private _crudService: CrudService,
        private _translationService: TranslationService,
        private _chatService: ChatService,
        private _userService: UserService,
        private route: ActivatedRoute,
        private modalService: NgbModal) {
            this.historyFilterObject = {};
    }

    ngOnInit() {
        this.route.queryParams.subscribe(queryParams => {
            if (queryParams.meetingId) {
                this.meetingId = queryParams.meetingId;
            }
            this.getLanguage();
            this.setFilterObject()
            this.getCurrentUser();
            // get meetings chats
            this.getMeetingChats(true);
            this.getAllChatRooms();
            this.listenToChatNotificationChannel();
        });
    }

    getMeetingChats(openChat: boolean = true) {
        this._chatService.getPaginatedList<PagedResult>('admin/meetings/chat-rooms', this.filterObject).
        subscribe(res => {
            this.meetings = res.Results;
            if (this.meetings.length > 0) {
                let index;
                if (this.meetingId && openChat) {
                    index = this.meetings.findIndex(item => item.id == this.meetingId);
                    if (index != -1) {
                        this.meetings[index].is_selected = true;
                        this.selectedMeeting = this.meetings[index];
                    } else {
                        this.getMeeting();
                    }
                } else {
                    this.meetings[0].is_selected = true;
                    this.selectedMeeting = this.meetings[0];
                    index = 0;
                }
                if(openChat) {
                    this.openChat(this.selectedMeeting,index);
                }
            } else {
                this.resetAllData();
            }
        },error => {
        });
    }

    getLanguage() {
      this.isArabic = this._translationService.isArabic();
    }

    setFilterObject() {
        this.filterObject.PageNumber = 1;
        this.filterObject.SortBy = 'last_message_date';
        this.filterObject.SortDirection = 'DESC';
        this.filterObject.SearchObject = {};
        this.filterObject.PageSize = 100;
    }

    openChat(meeting: Meeting, meetingIndex: number) {
        this.historyFilterObject.SearchObject = {};
        this.historyFilterObject.PageNumber = 1;
        this.historyFilterObject.PageSize = 25;
        const oldSelectedChatIndex = this.meetings.findIndex(item => item.is_selected == true);
        this.meetings[oldSelectedChatIndex].is_selected = false;
        this.meetings[meetingIndex].is_selected = true;
        this.selectedMeeting = this.meetings[meetingIndex];
        this.meetingId = this.selectedMeeting.id;
        // get meeting chat room history
        this.historyFilterObject.PageNumber = 1;
        this.getChatHistory(meeting,true);
        this.getChatData();
    }

    getChatHistory(meeting, isChatChanged) {
        this._chatService.getPaginatedList<any>('admin/meetings/' + meeting.id + '/chat-rooms', this.historyFilterObject).
        subscribe(res => {
            this.chatHistory = isChatChanged? res.Results.reverse() : res.Results.reverse().concat(this.chatHistory);
            this.chatNameAr = res.chat_name_ar;
            this.chatNameEn = res.chat_name_en;
            this.membersNumber = res.chat_members_number;
            this.totalRecords = res.TotalRecords;
            if (this.historyFilterObject.PageNumber != 1 && !isChatChanged) {
                this.myScrollContainer.nativeElement.scrollTop = 1000;
            }
        },
        error => {
        });
    }

    onScrollUp() {
        this.scrollToBottom = false;
        if (this.chatHistory.length < this.totalRecords) {
		    this.historyFilterObject.PageNumber++;
		 	this.getChatHistory(this.selectedMeeting,false);
		}
    }

    sendMessage(messageForm){
        if (this.message) {
            this.scrollToBottom = true;
            this.submitMessage = true;
            this._chatService.sendMeetingMesaage(this.selectedMeeting.id, {MessageText: this.message}).subscribe(res => {
                this.message = null;
                this.submitMessage = false;
                this.getMeetingChats(false);
            });
        }
    }

    listenTochannel() {
        window.Echo.channel(this.chatRoom.chat_room_name)
			.listen('.ChatEvent', (data) => {
                if(this.chatRoom.id == data.broadCastingData.chat_room_id) {
                    this.scrollToBottom = true;
					data.broadCastingData.is_send_by_current_user = this.user.chat_user_id == data.broadCastingData.sender_user_id ? true : false;
					let index = this.meetings.findIndex(item => item.id == this.selectedMeeting.id);
					this.meetings[index].last_message_text = data.broadCastingData.message_text;
					this.meetings[index].last_message_date = data.broadCastingData.message_time;
					this.getChatHistory(this.selectedMeeting, true);
                }
			}, (e) => {
			});
    }

    getCurrentUser() {
		this._userService.getCurrentUser().subscribe(res => {
			this.user = res.user;
		}, error => {
		});
    }

    getChatData() {
        this._chatService.getMeetingChat(this.selectedMeeting.id).subscribe(res => {
            this.chatRoom = res.chatRoom;
            this.listenTochannel();
        });
    }

	openReassignMarkers() {
        this.submitedStartConvensation = true;
		const modalRef = this.modalService.open(NewChatModalComponent, {
			size: "lg",
			backdrop: "static",
			centered: true,
        });
        modalRef.componentInstance.committeesList = this.committeesList;
        modalRef.componentInstance.meetingsList = this.meetingsList;
        modalRef.componentInstance.isArabic = this.isArabic;
        modalRef.componentInstance.isCommittees = false;
        modalRef.componentInstance.isMeetings = true;

        modalRef.result.then((result) => {
			if (result) {
                result.selectedMeeting.is_selected = true;
                // set old selected chat to be false
                let oldSelectedIndex = this.meetings.findIndex(item => item.id == this.selectedMeeting.id);
                if(oldSelectedIndex != -1){
                    this.meetings[oldSelectedIndex].is_selected = false;
                }
                let index = this.meetings.findIndex(item => item.id == result.selectedMeeting.id);
                if (index != -1) {
                    this.meetings[index].is_selected = true;
                } else {
                    this.meetings.unshift(result.selectedMeeting);
                }
                index = index != -1? index : 0;
                this.selectedMeeting = result.selectedMeeting;
                this.openChat(this.selectedMeeting,index);
			}
            this.submitedStartConvensation = false;
		}, (reason) => {
            this.submitedStartConvensation = false;
		});
    }

    getAllChatRooms(){
        this.chatRoomsFilterObject.PageNumber = 1;
        this.chatRoomsFilterObject.SortBy = 'id';
        this.chatRoomsFilterObject.SortDirection = 'DESC';
        this.chatRoomsFilterObject.SearchObject = {};
        this.chatRoomsFilterObject.PageSize = environment.pageSize;
        this._chatService.getAllChatRooms(this.chatRoomsFilterObject).subscribe(res => {
            this.committeesList = res.committeesList;
            this.meetingsList = res.meetingsList.Results;
        });
    }

    getMeeting(){
        this._crudService.get<Meeting>('admin/meetings',this.meetingId).subscribe(res => {
            res.is_selected = true;
            this.meetings.push(res);
            this.selectedMeeting = this.meetings[this.meetings.length -1];
        }, error => {
        });
    }

    compareDate(messageTime,chatHistory,messageIndex: number){
        let flag = true;
        if (messageIndex > 0) {
            messageTime = new Date (messageTime);
            let nextMessageTime = new Date(chatHistory[messageIndex -1].message_time);
            messageTime.setHours(0,0,0,0);
            nextMessageTime.setHours(0,0,0,0);
            flag = messageTime.getTime() != nextMessageTime.getTime()? true : false;
        }

        return flag;
    }

    resetSearch = function () {
		this.filterObject.SearchObject = {};
        this.getMeetingChats();
        this.getMeetingChats(true);
    };

    resetAllData() {
        this.selectedMeeting = new Meeting();
        this.chatHistory = [];
        this.chatNameAr = '';
        this.chatNameEn = '';
        this.membersNumber = null;
        this.totalRecords = 0;
        this.chatRoom = {};
    }


    listenToChatNotificationChannel() {
		window.Echo.channel('ChatNotifications')
            .listen('.ChatNotificationEvent', (data) => {
				const chat_users = data.data.sender_user.chat_users;
                const chat_guests = data.data.sender_user.chat_guests;
                let index = chat_users.findIndex(user => user.id == this.user.id);
                if (index == -1) {
                    index = chat_guests.findIndex(user => user == this.user.meeting_guest_id);
                }
				if (index != -1 && this.user.chat_user_id != data.data.sender_user_id) {
					if (!data.data.is_committee && !data.data.is_general_chat) {
                        this.getMeetingChats(true);
					}
				}
			}, (e) => {
				console.log(e);
			});
	}
}
