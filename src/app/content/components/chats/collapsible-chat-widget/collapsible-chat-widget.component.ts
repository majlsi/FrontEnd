import { Component, OnInit, Input, ViewChild, ElementRef , Renderer2, HostBinding, EventEmitter, Output} from "@angular/core";
import { User } from "../../../../core/models/user";
import { ChatService } from "../../../../core/services/chat/chat.service";
import { UserService } from "../../../../core/services/security/users.service";
import { environment } from "../../../../../environments/environment";
import { ChatGroup } from "../../../../core/models/chat-group";

@Component({
	selector: "m-collapsible-chat-widget",
	templateUrl: "./collapsible-chat-widget.component.html",
	styleUrls: ["./collapsible-chat-widget.component.scss"],
})
export class CollapsibleChatWidgetComponent implements OnInit {
	// @HostBinding('class.hidden') className = true;
	// @HostBinding('id') id = 'chatBoxCon';
	@ViewChild('chatBox') chatBox: ElementRef;
	@ViewChild('toggleChat') toggleChat: ElementRef;

	isCollapsed: boolean = false;
	user: User;
	chatData: any;
	chatHistory: Array<any> = [];
	@Input() isArabic: boolean;
	membersNumber: number;
	historyFilterObject: any;
	chatNameAr: string;
	chatNameEn: string;
	totalRecords: number;
	@ViewChild('scrollMe') private myScrollContainer: ElementRef;
	scrollToBottom: boolean = true;
	@Input() meetingId: number;
	@Input() markUnread;
	@Output() markReadMeesageEmiter = new EventEmitter();
	message: string = '';
	environment = environment;
	chatGroup: ChatGroup = new ChatGroup();
	submitMessage: boolean = false;


	constructor(private el: ElementRef,private _chatService: ChatService,
		private _userService: UserService) {
			this.historyFilterObject = {};

		}

	ngOnInit() {
		this.historyFilterObject.SearchObject = {};
        this.historyFilterObject.PageNumber = 1;
        this.historyFilterObject.PageSize = 25;
        // get meeting chat room history
        this.historyFilterObject.PageNumber = 1;
		this.getCurrentUser();
		this.getChatData();
	}

	onScrollUp(){
		this.scrollToBottom = false;
        if (this.chatHistory.length < this.totalRecords) {
		    this.historyFilterObject.PageNumber++;
		 	this.getChatHistory();
		}
	}

	listenTochannel(){
		window.Echo.channel(this.chatData.chat_room_name)
			.listen('.ChatEvent', (data) => {
                if(this.chatData.id == data.broadCastingData.chat_room_id) {
                    this.scrollToBottom = true;
                    data.broadCastingData.is_send_by_current_user = this.user.chat_user_id == data.broadCastingData.sender_user_id? true : false;
                    this.chatHistory.push(data.broadCastingData);
                }
			}, (e) => {
			});
	}

	getChatData() {
        this._chatService.getMeetingChat(this.meetingId).subscribe(res => {
			this.chatData = res.chatRoom;
			this.chatGroup = res.chatGroup;
			this.getChatHistory();
			this.listenTochannel();
		});
	}

	getCurrentUser() {
		this._userService.getCurrentUser().subscribe(
			res => {
				this.user = res.user;
			},
			error => { }
		);
	}

	getChatHistory() {
        // this._chatService.getPaginatedList<any>('admin/chat-groups/' + this.chatGroup.id, this.historyFilterObject).
        // subscribe(res => {
		// 	this.chatHistory = res.Results.reverse().concat(this.chatHistory);
        //     this.chatNameAr = res.chat_name_ar;
		// 	this.chatNameEn = res.chat_name_en;

        //     this.membersNumber = res.chat_members_number;
        //     this.totalRecords = res.TotalRecords;
        //     if (this.historyFilterObject.PageNumber != 1) {
        //         this.myScrollContainer.nativeElement.scrollTop = 1000;
        //     }
        // },
        // error => {
        // });
	}

	sendMessage(messageForm){
        if (this.message) {
			this.scrollToBottom = true;
			this.submitMessage = true;
			this._chatService.sendChatMesaage(this.chatGroup.id, {MessageText: this.message}).subscribe((res) => {
					this.message = null;
					this.submitMessage = false;
			}, err => {
				this.submitMessage = false;
			});
        }
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
	closeChatPopup(){
		this.isCollapsed=false;
		this.markReadMeesageEmiter.emit();
	}
	toggleCollapse(){
		this.isCollapsed = !this.isCollapsed;
		this.markReadMeesageEmiter.emit();
		// let chatPoup = this.el.nativeElement.querySelector('#chatBox');
	// 	if(this.isCollapsed){

	// 		this.className=false;
	// }
	// else{
	// 	this.className=true;

	// 	 }

	}
}
