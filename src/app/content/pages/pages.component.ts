import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	ChangeDetectionStrategy
} from '@angular/core';
import * as objectPath from 'object-path';
import { LayoutConfigService } from '../../core/services/layout-config.service';
import { ClassInitService } from '../../core/services/class-init.service';
import { Subject, of } from 'rxjs';
import { LayoutRefService } from '../../core/services/layout/layout-ref.service';
import { trigger, transition, AnimationBuilder, AnimationPlayer, style, animate, state } from '@angular/animations';
import { TranslationService } from '../../core/services/translation.service';
import {SplashScreenService} from '../../core/services/splash-screen.service';
import { environment } from '../../../environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from '../../core/services/security/users.service';
import {ChatService} from '../../core/services/chat/chat.service';
import Echo from 'laravel-echo';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../core/services/layout-utils.service';
import { MeetingService } from './../../core/services/meeting/meeting.service';
import { Roles } from '../../core/models/enums/roles';
import { NotificationService } from '../../core/services/notification/notification.service';
import { FileService } from '../../core/services/files/file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TourModalComponent } from '../components/help-center/tour-modal/tour-modal.component';
import { VideoGuideService } from '../../core/services/video-guide/video-guide.service';
import * as $ from 'jquery';

declare global {
	interface Window { io: any; }
	interface Window { Echo: any; }
}



/*window.io = window.io || require('socket.io-client');
window.Echo = window.Echo || new Echo({
	broadcaster: 'socket.io',
	host: environment.redisListenURL,
	path: '/socket.io',
});*/
@Component({
	selector: 'm-pages',
	templateUrl: './pages.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	animations: [
		trigger(
			'slideInOut',
			[
				transition(
					'void => true', // ---> Entering --->
					[
						style({ transform: 'translatex(-100%)' }),
						animate('300ms ease-in', style({ transform: 'translatex(0%)' }))
					]
				),
				transition(
					'true => void', // ---> Leaving --->
					[
						animate('300ms ease-in', style({ transform: 'translatex(-100%)' }))
					]
				),
				transition(
					'void => false', // <--- Entering <---
					[
						style({ transform: 'translatex(100%)' }),
						animate('300ms ease-in', style({ transform: 'translatex(0%)' }))
					]
				),
				transition(
					'false => void', // <--- Leaving <---
					[
						animate('300ms ease-in', style({ transform: 'translatex(100%)' }))
					]
				)
			]
		)
	]
})
export class PagesComponent implements OnInit, AfterViewInit {


	@HostBinding('class') classes = 'm-grid m-grid--hor m-grid--root m-page';
	@Input() selfLayout: any = 'blank';
	@Input() asideLeftDisplay: any;
	@Input() asideRightDisplay: any;
	@Input() asideLeftCloseClass: any;

	public player: AnimationPlayer;
	animationDir: string = 'slideInOut';

	// class for the header container
	pageBodyClass$: Subject<string> = new Subject();

	@ViewChild('mContentWrapper') contenWrapper: ElementRef;
	@ViewChild('mContent') mContent: ElementRef;
	userId: any;
	meeting_guest_id: any;
	isArabic: any;
	user: any;
	isNotCompleteData: boolean = false;

	constructor(
		private el: ElementRef,
		private configService: LayoutConfigService,
		public classInitService: ClassInitService,
		private router: Router,
		private meetingService: MeetingService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private layoutRefService: LayoutRefService,
		private animationBuilder: AnimationBuilder,
		private translationService: TranslationService,
		public toastr: ToastrManager,
		private _userService: UserService,
		private chatService: ChatService,
		private videoGuideService: VideoGuideService,
		private splashScreenService: SplashScreenService,
		private fileService: FileService,
		private modalService: NgbModal
	) {
		this.configService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			let pageBodyClass = '';
			this.selfLayout = objectPath.get(config, 'self.layout');
			if (this.selfLayout === 'boxed' || this.selfLayout === 'wide') {
				pageBodyClass += ' m-container m-container--responsive m-container--xxl m-page__container';
			}
			this.pageBodyClass$.next(pageBodyClass);

			this.asideLeftDisplay = objectPath.get(config, 'aside.left.display');

			this.asideRightDisplay = objectPath.get(config, 'aside.right.display');
		});

		this.classInitService.onClassesUpdated$.subscribe((classes) => {
			this.asideLeftCloseClass = objectPath.get(classes, 'aside_left_close');
		});

		// animate page load
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (this.contenWrapper) {
					// hide content
					this.contenWrapper.nativeElement.style.display = 'none';
				}
			}
			if (event instanceof NavigationEnd) {
				if (this.contenWrapper) {
					// show content back
					this.contenWrapper.nativeElement.style.display = '';
					// animate the content
					this.animate(this.contenWrapper.nativeElement);
				}
			}
		});
	}

	ngOnInit(): void {
		this.startTour();
		this.getLanguage();
		this.getCurrentUser();
		// this.listenToMeetingStatusesChannel();
		this.listenToJoinToPresentationChannel();
		/* this.listenToCheckMeetingAttendance(); */
		this.listenToEndPresentationChannel();
		// this.listenToNewTaskChannel();
		// this.listenToEditTaskChannel();
		// this.listenToTaskExpiredChannel();
		// this.listenToTaskStatusChangedChannel();
		this.listenToChatNotificationChannel();
		this.splashScreenService.isNotCompleteData.subscribe((show) => {
			if (show) {
				this.isNotCompleteData = show;
			}
		});
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			if (this.mContent) {
				// keep content element in the service
				this.layoutRefService.addElement('content', this.mContent.nativeElement);
			}
		});
	}

	/**
	 * Animate page load
	 */
	animate(element) {
		this.player = this.animationBuilder
			.build([
				style({ opacity: 0, transform: 'translateY(15px)' }),
				animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
				style({ transform: 'none' }),
			])
			.create(element);
		this.player.play();
	}

	listenToMeetingStatusesChannel() {
		window.Echo.channel('notification')
			.listen('.SendNotificationEvent', (data) => {
				const meetingMemberIds = data.data.meetingMemberIds;
				this.findUser(meetingMemberIds, this.userId).subscribe(res => {
					if (res) {
						let message;
						let title;
						if (this.isArabic) {
							message = data.data.notificationMessageAr;
							title = data.data.notificationTitleAr;
						} else {
							message = data.data.notificationMessageEn;
							title = data.data.notificationTitleEn;
						}
						const meetingId = +data.data.meetingId;

						this.toastr.infoToastr(message, title, {
							animate: null,
							toastTimeout: environment.toastTimeout,
							position: 'bottom-left'
						});
						this.toastr.onClickToast().subscribe(() => {
							this.router.navigate(['/view-meetings/' + meetingId]);
						});

					}
				}, error => {

				});

				/**/
			}, (e) => {
				console.log(e);
			});

	}

	listenToNewTaskChannel() {
		window.Echo.channel('newTaskNotification')
			.listen('.NewTaskNotificationEvent', (data) => {
				const assignedTo = data.data.assignedTo;
				if (this.userId === assignedTo) {
					let message;
					let title;
					if (this.isArabic) {
						message = data.data.notificationMessageAr;
						title = data.data.notificationTitleAr;
					} else {
						message = data.data.notificationMessageEn;
						title = data.data.notificationTitleEn;
					}
					const taskId = +data.data.taskId;

					this.toastr.infoToastr(message, title, {
						animate: null,
						toastTimeout: environment.toastTimeout,
						position: 'bottom-left'
					});
					this.toastr.onClickToast().subscribe(() => {
						this.router.navigate(['/tasks-management/task-details/' + taskId]);
					});

				}
			}, (e) => {
				console.log(e);
			});

	}

	listenToTaskExpiredChannel() {
		window.Echo.channel('taskExpiredNotification')
			.listen('.TaskExpiredNotificationEvent', (data) => {
				const assignedTo = data.data.assignedTo;
				if (this.userId === assignedTo) {
					let message;
					let title;
					if (this.isArabic) {
						message = data.data.notificationMessageAr;
						title = data.data.notificationTitleAr;
					} else {
						message = data.data.notificationMessageEn;
						title = data.data.notificationTitleEn;
					}
					const taskId = +data.data.taskId;

					this.toastr.infoToastr(message, title, {
						animate: null,
						toastTimeout: environment.toastTimeout,
						position: 'bottom-left'
					});
					this.toastr.onClickToast().subscribe(() => {
						this.router.navigate(['/tasks-management/task-details/' + taskId]);
					});

				}
			}, (e) => {
				console.log(e);
			});

	}

	listenToTaskStatusChangedChannel() {
		window.Echo.channel('taskStatusChangedNotification')
			.listen('.TaskStatusChangedNotificationEvent', (data) => {
				const userIds = data.data.userIds;
				this.findUser(userIds, this.userId).subscribe(res => {
					if (res) {
						let message;
						let title;
						if (this.isArabic) {
							message = data.data.notificationMessageAr;
							title = data.data.notificationTitleAr;
						} else {
							message = data.data.notificationMessageEn;
							title = data.data.notificationTitleEn;
						}
						const taskId = +data.data.taskId;

						this.toastr.infoToastr(message, title, {
							animate: null,
							toastTimeout: environment.toastTimeout,
							position: 'bottom-left'
						});
						this.toastr.onClickToast().subscribe(() => {
							this.router.navigate(['/tasks-management/task-details/' + taskId]);
						});

					}
				}, error => {

				});
			}, (e) => {
				console.log(e);
			});

	}

	listenToJoinToPresentationChannel() {
		window.Echo.channel('presentAttachmentToParticipants')
			.listen('.PresentAttachmentToParticipantsEvent', (data) => {
				const meetingMemberIds = data.data.meetingMemberIds;
				const meetingOrganisersIds = data.data.meetingOrganisersIds;
				const meetingGuestIds = data.data.meetingGuestIds;
				let isExist = false;
				this.findUser(meetingMemberIds, this.userId).subscribe(res => {
					if (res) {
						isExist = true;
					}
				}, error => {

				});
				if (!isExist) {
					this.findUser(meetingGuestIds, this.user.meeting_guest_id).subscribe(res => {
						if (res) {
							isExist = true;
						}
					}, error => {

					});
				}

				if (isExist) {
					let message;
					let title;
					if (this.isArabic) {
						message = data.data.notificationMessageAr;
						title = data.data.notificationTitleAr;
					} else {
						message = data.data.notificationMessageEn;
						title = data.data.notificationTitleEn;
					}
					const meetingId = +data.data.meetingId;
					const attachmentId = +data.data.attachmentId;
					const meetingAgendaId = +data.data.meetingAgendaId;


					const presenterUserId = +data.data.presenterUserId;
					const presenterUserRoleId = +data.data.presenterUserRoleId;

					const url = 'meetings/' + meetingId + '/meeting_agenda/' + meetingAgendaId + '/attachments/' + attachmentId;

					if (data.data.forcePresent === true) {
						window.open(url, '_self');
					} else {
						if (this.user.meeting_guest_id == null && this.userId !== presenterUserId) {
							this.showPresentationPopup(title, message, url);
						} else if (this.user.meeting_guest_id != null && this.user.meeting_guest_id != presenterUserId) {
							this.showPresentationPopup(title, message, url);
						}
					}
				}

				/**/
			}, (e) => {
				console.log(e);
			});

	}
	listenToEndPresentationChannel() {
		window.Echo.channel('endPresentation')
			.listen('.EndPresentationEvent', (data) => {
				const meetingMemberIds = data.data.meetingMemberIds;
				const meetingGuestIds = data.data.meetingGuestIds;
				let isExist = false;
				this.findUser(meetingMemberIds, this.userId).subscribe(res => {
					if (res) {
						isExist = true;
					}
				}, error => {

				});


				if (!isExist) {
					this.findUser(meetingGuestIds, this.user.meeting_guest_id).subscribe(res => {
						if (res) {
							isExist = true;
						}
					}, error => {

					});
				}

				if (isExist) {
					let message;
					let title;
					if (this.isArabic) {
						message = data.data.notificationMessageAr;
						title = data.data.notificationTitleAr;
					} else {
						message = data.data.notificationMessageEn;
						title = data.data.notificationTitleEn;
					}
					const presenterUserId = +data.data.presenterUserId;

					if (this.userId !== presenterUserId) {
						this.layoutUtilsService.logOut();
						const dialogRef = this.layoutUtilsService.notification(
							title,
							message,
							'',
							this.translate.instant('BUTTON.OK')
						);
						dialogRef.afterClosed().subscribe(resp => {
							if (!resp) {
								return;
							}
						});
					}
				}

				/**/
			}, (e) => {
				console.log(e);
			});

	}

	showPresentationPopup(title, description, url) {

		const _title: string = title;
		const _description: string = description;
		const _waitDesciption: string = '';
		const _activationMessage = ``;
		const _buttonText = this.translate.instant('PRESENTATION.JOIN_PRESENTATION');

		this.layoutUtilsService.logOut();
		const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, _buttonText);
		// dialogRef.close();
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			window.open(url, '_self');

		});
	}

	findUser(meetingMemberIds, userId) {
		const users = meetingMemberIds.filter(meetingMemberId => meetingMemberId === userId);
		if (users.length) {
			return of(true);
		} else {
			return of(false);
		}
	}
	getLanguage() {
		this.isArabic = this.translationService.isArabic();
	}

	getCurrentUser() {
		this._userService.getCurrentUser().subscribe(res => {
			this.userId = res.user.id;
			this.meeting_guest_id = res.user.meeting_guest_id;
			this.user = res.user;
			this.fileService.reloadStorageQuota();
		}, error => {

		});
	}

	listenToCheckMeetingAttendance() {
		window.Echo.channel('sendCheckMeetingAttendance')
			.listen('.SendCheckMeetingAttendanceEvent', (data) => {
				const meetingMemberIds = data.data.meetingMemberIds;
				this.findUser(meetingMemberIds, this.userId).subscribe(res => {
					if (res) {
						const meetingId = +data.data.meetingId;
						let _title: string = '';
						let _description: string = '';
						if (this.isArabic) {
							_description = data.data.notificationMessageAr;
							_title = data.data.notificationTitleAr;
						} else {
							_description = data.data.notificationMessageEn;
							_title = data.data.notificationTitleEn;
						}

						const dialogRef = this.layoutUtilsService.notification(_title, _description, '', this.translate.instant('BUTTON.OK'));
						dialogRef.afterClosed().subscribe(resp => {
							if (!resp) {
								return;
							}
							this.meetingService.takeParticipantAttendance(meetingId).
								subscribe(pagedData => {

								},
									error => {
									});
						});
					}
				}, error => {

				});

				/**/
			}, (e) => {
				console.log(e);
			});
	}

	listenToEditTaskChannel() {
		window.Echo.channel('editTaskNotification')
			.listen('.EditTaskNotificationEvent', (data) => {
				const assignedTo = data.data.assignedTo;
				if (this.userId === assignedTo) {
					let message;
					let title;
					if (this.isArabic) {
						message = data.data.notificationMessageAr;
						title = data.data.notificationTitleAr;
					} else {
						message = data.data.notificationMessageEn;
						title = data.data.notificationTitleEn;
					}
					const taskId = +data.data.taskId;

					this.toastr.infoToastr(message, title, {
						animate: null,
						toastTimeout: environment.toastTimeout,
						position: 'bottom-left'
					});
					this.toastr.onClickToast().subscribe(() => {
						this.router.navigate(['/tasks-management/task-details/' + taskId]);
					});

				}
			}, (e) => {
				console.log(e);
			});
	}

	listenToChatNotificationChannel() {
		window.Echo.channel('ChatNotifications')
			.listen('.ChatNotificationEvent', (data) => {
				const chat_users = data.data.sender_user.chat_users;
				const chat_guests = data.data.sender_user.chat_guests;
				let index = chat_users.findIndex(user => user.id == this.userId);
				if (index == -1) {
					index = chat_guests.findIndex(user => user == this.meeting_guest_id);
				}
				if (index != -1 && this.user.chat_user_id != data.data.sender_user_id && (!data.data.is_chat_updated)) {
					this.chatService.addNewChatNotificationsIdsArray(data.data.chat_room_id);
					// let message = data.data.message_text;
					// let title = this.isArabic? data.data.chat_name_ar: (data.data.chat_name? data.data.chat_name : data.data.chat_name_ar);
					// this.toastr.infoToastr(message, title, {
					// 	animate: null,
					// 	toastTimeout: environment.toastTimeout,
					// });
					// if (data.data.chat_group_id) {
					// 	const chatGroupId = +data.data.chat_group_id;
					// 	this.toastr.onClickToast().subscribe(() => {
					// 		this.router.navigate(['/conversations/chats'],{ queryParams: { chatGroupId: chatGroupId } });
					// 	});
					// }
				}
			}, (e) => {
				console.log(e);
			});
	}


	openTour() {
		const modalRef = this.modalService.open(TourModalComponent,
			{ centered: true, windowClass: 'hidden-modal-content tour-modal', size: 'sm', backdropClass: 'noBackdrop' });
		// modalRef.componentInstance.page = this.page;

		setTimeout(() => {
			modalRef.componentInstance.changeHeight = true;
		}, 10);
	}

	startTour(){
		this.videoGuideService.routeUrl.subscribe(res => {
			let startConversationFullScreenButton = $('#startConversationFullScreen');
			if(res == this.router.url){
				let list = this.videoGuideService.getGuideStepsList();
				if(startConversationFullScreenButton.length && startConversationFullScreenButton.offset().top){
					list[0] = list[0] + 'FullScreen';
				}
				if(list && list.length > 0){
					this.videoGuideService.startGuide(list);
				}
			}
		});
	}

}
