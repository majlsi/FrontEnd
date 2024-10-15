import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewChatModalComponent } from '../new-chat-modal/new-chat-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { ChatGroup } from '../../../../core/models/chat-group';
import { PagedResult } from '../../../../core/models/paged-result';
import { TranslationService } from '../../../../core/services/translation.service';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../core/services/security/users.service';
import { User } from '../../../../core/models/user';
import { EditChatInfoModalComponent } from '../edit-chat-info-modal/edit-chat-info-modal.component';
import { GroupChatMembersModalComponent } from '../group-chat-members-modal/group-chat-members-modal.component';
import {
	LayoutUtilsService,
	MessageType,
} from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
import * as $ from 'jquery';

@Component({
	selector: 'm-chat-list',
	templateUrl: './chat-list.component.html',
	styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, AfterViewInit {
	filterObject = new FilterObject();
	historyFilterObject: any;
	chatGroups: Array<ChatGroup> = [];
	chatHistory: Array<any> = [];
	isArabic: boolean;
	chatNameAr: string;
	chatNameEn: string;
	chatCreatedAt: any;
	membersNumber: number;
	environment = environment;
	@ViewChild('scrollMe') private myScrollContainer: ElementRef;
	@ViewChild('scrollDown') private myScrollDown: ElementRef;
	scrollToBottom: boolean = true;
	totalRecords: number;
	chatGroupsTotalRecords: number;
	selectedChatGroup: ChatGroup = new ChatGroup();
	message: string = '';
	user: User;
	chatRoom: any;
	chatRoomsFilterObject = new FilterObject();
	submitedStartConvensation: boolean = false;
	chatGroupId: number;
	isCollapsed: boolean = false;
	imagesBaseURL = environment.imagesBaseURL;
	chatGroupLogoURL: string = '';
	canEditName: boolean = false;
	userObs: Observable<any>;
	chatList = true;
	chatDetailsOpened = false;
	isChatHistory: boolean = false;
	newMsgChatRoomIds: Array<number> = [];
	submitMessage: boolean = false;

	constructor(
		private router: Router,
		private datePipe: DatePipe,
		private _crudService: CrudService,
		private _translationService: TranslationService,
		private _chatService: ChatService,
		private _userService: UserService,
		private route: ActivatedRoute,
		private modalService: NgbModal,
		private translate: TranslateService,
		private videoGuideService: VideoGuideService,
		private layoutUtilsService: LayoutUtilsService
	) {
		this.historyFilterObject = {};
	}

	ngOnInit() {
		this.route.queryParams.subscribe((queryParams) => {
			this._chatService.newChatNotificationsIdsUpdate.subscribe((data) => {
				if (data) {
					this.newMsgChatRoomIds = data;
				}
			});
			if (queryParams.chatGroupId) {
				this.chatGroupId = queryParams.chatGroupId;
			}
			this.getCurrentUser();
			this.getLanguage();
			this.setFilterObject();
			forkJoin([this.userObs]).subscribe((data) => {
				this.user = data[0].user;
				// get chat groups
				this.getChatGroups(true);
				this.listenToChatNotificationChannel();
			});
		});
	}

	ngAfterViewInit(): void {
		this.checkTutorialGuide();
	}

	getChatGroups(
		openChat: boolean = true,
		type: string = '',
		isScroll: boolean = false
	) {
		this.filterObject.PageNumber =
			type == '' ? this.filterObject.PageNumber : 1;
		this._chatService
			.getPaginatedList<PagedResult>(
				'admin/chat-groups',
				this.filterObject
			)
			.subscribe(
				(res) => {
					if (this.filterObject.PageNumber == 1) {
						this.myScrollDown.nativeElement.scrollTop = 0;
					}
					let list = this.chatGroups.concat(res.Results);
					this.chatGroups = isScroll
						? list.filter(function (item, index) {
							return (
								list.findIndex(
									(itemlist) => itemlist.id == item.id
								) == index
							);
						})
						: res.Results;
					this.chatGroupsTotalRecords = +res.TotalRecords;
					if (this.chatGroups.length > 0) {
						let index;
						if (this.chatGroupId && openChat && type == '') {
							index = this.chatGroups.findIndex(
								(item) => item.id == this.chatGroupId
							);
							if (index != -1) {
								this.chatGroups[index].is_selected = true;
								this.selectedChatGroup = this.chatGroups[index];
							} else {
								this.getChatGroup();
								index = 0;
							}
						} else {
							this.chatGroups[0].is_selected = true;
							this.selectedChatGroup = this.chatGroups[0];
							index = 0;
						}
						this.newMsgChatRoomIds.forEach(element => {
							const chatMarkedIndex = this.chatGroups.findIndex(chat => {
								return chat.chat_room_id === element;
							});

							if (chatMarkedIndex !== -1) {
								this.chatGroups[chatMarkedIndex].markUnread = true;
							}
						});

						if (openChat) {
							this.openChat(this.selectedChatGroup, index);
						}
					} else {
						this.resetAllData();
					}
				},
				(error) => { }
			);
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	setFilterObject() {
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = 'last_message_date';
		this.filterObject.SortDirection = 'DESC';
		this.filterObject.SearchObject = {};
		this.filterObject.PageSize = 25;
	}

	openChat(chatGroup: ChatGroup, chatGroupIndex: number) {
		this.historyFilterObject.SearchObject = {};
		this.historyFilterObject.PageNumber = 1;
		this.historyFilterObject.PageSize = 25;
		const oldSelectedChatIndex = this.chatGroups.findIndex(
			(item) => item.is_selected == true
		);
		if (oldSelectedChatIndex > -1) {
			this.chatGroups[oldSelectedChatIndex].is_selected = false;
		}
		this.chatGroups[chatGroupIndex].is_selected = true;
		this.chatGroups[chatGroupIndex].markUnread = false;
		this._chatService.removeReadChatNotificationsId(this.chatGroups[chatGroupIndex].chat_room_id);
		this.selectedChatGroup = this.chatGroups[chatGroupIndex];
		this.chatGroupId = this.selectedChatGroup.id;
		// get chat room history
		this.historyFilterObject.PageNumber = 1;
		this.getChatHistory(chatGroup, true);
		this.getChatData();

		// if (window.screen.width <= 1024) {
		// 	// 768px portrait
		// 	this.chatList = false;
		// 	this.chatDetailsOpened = true;
		// }
	}

	getChatHistory(chatGroup, isChatChanged) {
		this._chatService
			.getPaginatedList<any>(
				'admin/chat-groups/' + chatGroup.id,
				this.historyFilterObject
			)
			.subscribe(
				(res) => {
					this.chatHistory = isChatChanged
						? res.Results.reverse()
						: res.Results.reverse().concat(this.chatHistory);
					this.chatNameAr = res.chat_name_ar;
					this.chatNameEn = res.chat_name_en;
					this.chatCreatedAt = new Date(res.created_at.date);
					this.membersNumber = res.chat_members_number;
					this.totalRecords = res.TotalRecords;
					this.canEditName = res.can_edit_chat_group;
					this.chatGroupLogoURL = this.getChatLogo(res);
					if (
						this.historyFilterObject.PageNumber != 1 &&
						!isChatChanged
					) {
						this.myScrollContainer.nativeElement.scrollTop = 1000;
					}
				},
				(error) => { }
			);
	}

	onScrollUp() {
		this.scrollToBottom = false;
		if (this.chatHistory.length < this.totalRecords) {
			this.historyFilterObject.PageNumber++;
			this.getChatHistory(this.selectedChatGroup, false);
		}
	}

	sendMessage(messageForm) {
		if (this.message) {
			this.scrollToBottom = true;
			const messageText = this.message;
			this.message = null;
			this.submitMessage = true;
			this._chatService
				.sendChatMesaage(this.selectedChatGroup.id, {
					MessageText: messageText,
				})
				.subscribe((res) => {
					this.message = null;
					this.submitMessage = false;
					this.getChatGroups(false, 'send-message');
				}, error => {
					this.submitMessage = false;
				});
		}
	}

	listenTochannel() {
		window.Echo.channel(this.chatRoom.chat_room_name).listen(
			'.ChatEvent',
			(data) => {
				data.broadCastingData.sender_user.chat_users.push({id: data.broadCastingData.sender_user.id});
				let index = data.broadCastingData.sender_user.chat_users.findIndex(
					(user) => user.id == this.user.id
				);
				if (this.chatRoom.id == data.broadCastingData.chat_room_id && index != -1) {
					this.scrollToBottom = true;
					data.broadCastingData.is_send_by_current_user =
						this.user.chat_user_id ==
							data.broadCastingData.sender_user_id
							? true
							: false;
					let index = this.chatGroups.findIndex(
						(item) => item.id == this.selectedChatGroup.id
					);
					this.chatGroups[index].last_message_text =
						data.broadCastingData.message_text;
					this.chatGroups[index].last_message_date =
						data.broadCastingData.message_time;
					this.getChatHistory(this.selectedChatGroup, true);
				}
			},
			(e) => { }
		);
	}

	getCurrentUser() {
		this.userObs = this._userService.getCurrentUser();
	}

	getChatData() {
		this._chatService
			.getChat(this.selectedChatGroup.id)
			.subscribe((res) => {
				this.chatRoom = res.chatRoom;
				this.listenTochannel();
			});
	}

	openReassignMarkers() {
		this.submitedStartConvensation = true;
		const modalRef = this.modalService.open(NewChatModalComponent, {
			// size: "sm",
			backdrop: 'static',
			centered: true,
		});
		modalRef.componentInstance.isArabic = this.isArabic;


		modalRef.result.then(
			(result) => {
				if (result) {
					result.chatGroup.is_selected = true;
					// set old selected chat to be false
					let oldSelectedIndex = this.chatGroups.findIndex(
						(item) => item.id == this.selectedChatGroup.id
					);
					if (oldSelectedIndex != -1) {
						this.chatGroups[oldSelectedIndex].is_selected = false;
					}
					let index = this.chatGroups.findIndex(
						(item) => item.id == result.chatGroup.id
					);
					if (index != -1) {
						this.chatGroups[index].is_selected = true;
					} else {
						this.chatGroups.unshift(result.chatGroup);
					}
					index = index != -1 ? index : 0;
					this.selectedChatGroup = result.chatGroup;
					this.openChat(this.selectedChatGroup, index);
				}
				this.submitedStartConvensation = false;
			},
			(reason) => {
				this.submitedStartConvensation = false;
			}
		);
	}

	openEditChatInfo() {
		const modalRef = this.modalService.open(EditChatInfoModalComponent, {
			// size: "sm",
			backdrop: 'static',
			centered: true,
		});
		modalRef.componentInstance.chatGroup = JSON.parse(
			JSON.stringify(this.selectedChatGroup)
		);
		modalRef.componentInstance.chatGroupId = this.selectedChatGroup.id;
		modalRef.result.then(
			(result) => {
				if (result) {
					this.selectedChatGroup = result.chatGroup;
					this.selectedChatGroup.chat_group_logo_url = this.selectedChatGroup.chat_group_logo ? this.selectedChatGroup.chat_group_logo.image_url : null;
					let index = this.chatGroups.findIndex(
						(chatGroup) => chatGroup.id == this.selectedChatGroup.id
					);
					this.chatGroups[index] = this.selectedChatGroup;
					this.chatGroupLogoURL = this.getChatLogo(this.selectedChatGroup);
					this.layoutUtilsService.showActionNotification(
						this.isArabic
							? result.res.message_ar
							: result.res.message
					);
				}
			},
			(reason) => { }
		);
	}

	openGroupChatMembersModal() {
		const modalRef = this.modalService.open(
			GroupChatMembersModalComponent,
			{
				// size: "sm",
				backdrop: 'static',
				centered: true,
			}
		);
		modalRef.componentInstance.chatGroupId = this.selectedChatGroup.id;
		modalRef.componentInstance.chatGroup = JSON.parse(
			JSON.stringify(this.selectedChatGroup)
		);
		modalRef.componentInstance.currentUser = JSON.parse(
			JSON.stringify(this.user)
		);
		modalRef.componentInstance.organizationLogoUrl = this.selectedChatGroup.organization_logo_url;
		modalRef.result.then(
			(result) => {
				if (result) {
					this.selectedChatGroup.member_users = result.memberUsers;
					let index = this.chatGroups.findIndex(
						(chatGroup) => chatGroup.id == this.selectedChatGroup.id
					);
					this.chatGroups[index] = this.selectedChatGroup;
					this.layoutUtilsService.showActionNotification(
						this.isArabic
							? result.res.message_ar
							: result.res.message
					);
				}
			},
			(reason) => { }
		);
	}

	getChatGroup() {
		this._crudService
			.get<ChatGroup>('admin/chat-groups', this.chatGroupId)
			.subscribe(
				(res) => {
					res.is_selected = true;
					this.chatGroups.push(res);
					this.selectedChatGroup = this.chatGroups[
						this.chatGroups.length - 1
					];
				},
				(error) => { 
					this.chatGroups[0].is_selected = true;
					this.selectedChatGroup = this.chatGroups[0];
					this.openChat(this.selectedChatGroup, 0);		
				}
			);
	}

	compareDate(messageTime, chatHistory, messageIndex: number) {
		let flag = true;
		if (messageIndex > 0) {
			messageTime = new Date(messageTime);
			let nextMessageTime = new Date(
				chatHistory[messageIndex - 1].message_time
			);
			messageTime.setHours(0, 0, 0, 0);
			nextMessageTime.setHours(0, 0, 0, 0);
			flag =
				messageTime.getTime() != nextMessageTime.getTime()
					? true
					: false;
		}

		return flag;
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getChatGroups(true);
	};

	resetAllData() {
		this.selectedChatGroup = new ChatGroup();
		this.chatHistory = [];
		this.chatNameAr = '';
		this.chatNameEn = '';
		this.membersNumber = null;
		this.totalRecords = 0;
		this.chatRoom = {};
	}

	listenToChatNotificationChannel() {
		window.Echo.channel('ChatNotifications').listen(
			'.ChatNotificationEvent',
			(data) => {
				if (this.router.url === '/conversations/chats') {
					const chat_users = data.data.sender_user.chat_users;
					let indexForDeletedUser =  -1 ;
					if (data.data.sender_user.deleted_chat_users) {
						let deleted_chat_users = data.data.sender_user.deleted_chat_users;
						indexForDeletedUser = deleted_chat_users.findIndex(
							(user) => user.id == this.user.id
						);
					}
					let index = chat_users.findIndex(
						(user) => user.id == this.user.id
					);
					if (
						(index != -1 &&
						this.user.chat_user_id != data.data.sender_user_id) || 
						(indexForDeletedUser != -1)
					) {
						// chat_room_id
						this.getChatGroups(true);
					}
				}
			},
			(e) => {
				console.log(e);
			}
		);
	}

	getChatImage(chatGroup: ChatGroup) {
		let index = chatGroup.member_users.findIndex(
			(user) => this.user.id != user.id
		);
		if (chatGroup.committee_id) {
			return './assets/app/media/img/icons/committee-icon.png';
		} else if (chatGroup.meeting_id) {
			return './assets/app/media/img/icons/meeting-icon.png';
		} else if (
			!chatGroup.meeting_id &&
			!chatGroup.committee_id &&
			chatGroup.is_group_chat &&
			chatGroup.chat_group_logo_url
		) {
			return this.imagesBaseURL + chatGroup.chat_group_logo_url;
		} else if (
			(!chatGroup.meeting_id &&
				!chatGroup.committee_id &&
				chatGroup.is_group_chat &&
				!chatGroup.chat_group_logo_url)
		) {
			return './assets/app/media/img/icons/group-icon.png';
		} else if ((!chatGroup.meeting_id &&
				!chatGroup.committee_id &&
				!chatGroup.is_group_chat &&
				chatGroup.member_users[index] &&
				!chatGroup.member_users[index].image)) {	
			return './assets/app/media/img/icons/individual.png';
		} else if (
			!chatGroup.meeting_id &&
			!chatGroup.committee_id &&
			!chatGroup.is_group_chat &&
			chatGroup.member_users[index] &&
			chatGroup.member_users[index].image
		) {
			return (
				this.imagesBaseURL +
				chatGroup.member_users[index].image.image_url
			);
		}
	}

	getChatLogo(data) {
		if (data.meeting_id) {
			return './assets/app/media/img/icons/meeting-icon.png';
		} else if (data.committee_id) {
			return './assets/app/media/img/icons/committee-icon.png';
		} else if (data.chat_group_logo_url) {
			return this.imagesBaseURL + data.chat_group_logo_url;
		} else {
			return './assets/app/media/img/icons/group-icon.png';
		}
	}

	getMemberUserImage(memberUser, organizationLogoUrl) {
		if (memberUser.image) {
			return this.imagesBaseURL + memberUser.image.image_url;
		} else {
			return './assets/app/media/img/icons/individual.png';
		}
	}

	deleteMemberUser(memberUser, selectedChatGroup) {
		const _title: string = this.translate.instant(
			'CONVERSATIONS.DELETE.TITLE'
		);
		const _description: string = this.translate.instant(
			'CONVERSATIONS.DELETE.DESCRIPTION'
		);
		const _waitDesciption: string = this.translate.instant(
			'CONVERSATIONS.DELETE.WAITDESCRIPTION'
		);
		const _deleteMessage = this.translate.instant(
			'CONVERSATIONS.DELETE.DELETE_MESSAGE'
		);

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption,
			this.translate.instant('BUTTON.DELETE')
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}
			this._crudService
				.delete<any>(
					'admin/chat-groups/' +
					selectedChatGroup.id +
					'/chat-group-users',
					memberUser.id
				)
				.subscribe(
					(pagedData) => {
						this.layoutUtilsService.showActionNotification(
							_deleteMessage,
							MessageType.Delete
						);
						let index = this.selectedChatGroup.member_users.findIndex(
							(user) => user.id == memberUser.id
						);
						this.selectedChatGroup.member_users.splice(index, 1);
					},
					(error) => {
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(
								error.error_ar,
								MessageType.Delete
							);
						} else {
							this.layoutUtilsService.showActionNotification(
								error.error,
								MessageType.Delete
							);
						}
					}
				);
		});
	}

	onScrollDown() {
		if (this.chatGroups.length < this.chatGroupsTotalRecords) {
			this.filterObject.PageNumber++;
			this.getChatGroups(false, '', true);
		}
	}

	backToChatList(content) {
		this.chatList = true;
		this.isChatHistory = false;
		this.chatDetailsOpened = false;
	}

	formatDateOfLastMessageOfChatGroup(lastChatMessageDate) {
		let messageTime = new Date(lastChatMessageDate);
		let today = new Date();

		messageTime.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		
		if (messageTime.getTime() != today.getTime()){
			return this.datePipe.transform(new Date(lastChatMessageDate), "dd/MM/yyyy");
		} else {
			return this.datePipe.transform(new Date(lastChatMessageDate), "h:mm a");
		}
	}

	checkTutorialGuide() {
		let startConversationFullScreenButton = $('#startConversationFullScreen').first();
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			if(startConversationFullScreenButton.offset().top){
				list[0] = list[0] + 'FullScreen';
			}
			this.videoGuideService.startGuide(list);
		}
	}
}
