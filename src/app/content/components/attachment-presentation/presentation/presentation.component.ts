import { MeetingAgenda } from './../../../../core/models/meeting-agenda';
import {
	Component,
	OnInit,
	ViewChild,
	ChangeDetectionStrategy,
	ElementRef,
	AfterViewInit,
	HostListener,
	TemplateRef,
	OnDestroy,
	Input
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, fromEvent, of, Subscription, merge, Observable } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';

import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { CrudService } from '../../../../core/services/shared/crud.service';

import { environment } from '../../../../../environments/environment';
import { switchMap, takeUntil, pairwise, map } from 'rxjs/operators';
import { UserService } from '../../../../core/services/security/users.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { Roles } from '../../../../core/models/enums/roles';
import { Meeting } from '../../../../core/models/meeting';
import { HeaderService } from '../../../../core/services/layout/header.service';
import { VoteStatus } from '../../../../core/models/vote-status';
import { AgendaVotesCommentsAsideComponent } from './agenda-votes-comments-aside/agenda-votes-comments-aside.component';
import { Attachment } from '../../../../core/models/attachment';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { VoteParticipants } from '../../../../core/models/vote-participants';

@Component({
	selector: 'm-presentation',
	templateUrl: './presentation.component.html',
	styleUrls: ['./presentation.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class PresentationComponent implements AfterViewInit, OnInit {
	@ViewChild('myCanvas') canvas: ElementRef;
	@ViewChild('content') modalContent: TemplateRef<any>;
	@ViewChild(AgendaVotesCommentsAsideComponent) private voteMenuMenu: AgendaVotesCommentsAsideComponent;
	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;
	closeResult: string;
	isArabic: boolean;
	presentationSlidesObs: Observable<any>;
	attachmentId: number;
	presentationSlides: any;
	imagesBaseURL = environment.imagesBaseURL;
	cx: CanvasRenderingContext2D;
	currentSlide: number;
	userId: any;
	textNotes: string = '';
	isClient: boolean;
	subscription: Subscription;
	subscr: Subscription;
	winWidth: any = window.innerWidth;
	winHeight: any = window.innerHeight;
	isPointer: boolean = false;
	isDrawing: boolean = false;
	drawingSubscription: Subscription;
	isText: boolean = false;
	clickSubscription: Subscription;
	textPositionX: number;
	textPositionY: number;
	isEraser: any;
	eraserMoveSubscription: Subscription;
	isDown: boolean;
	eraserDownSubscription: Subscription;
	eraserLeaveSubscription: Subscription;
	eraserUpSubscription: Subscription;
	eraserDiameter = 20;
	attachmentObs: Observable<any>;
	attachment: any;
	presenterName: string;
	meetingId: any;
	meetingAgendaId: any;
	isLoaded: boolean = false;
	presenterUserId: any;
	presentationNotes: any;
	order: number = 0;
	checkPresentationMasterObs: Observable<any>;
	textRect: ClientRect | DOMRect;
	resizeTimeout: any;
	mouseEvents = ['mousedown', 'mouseup', 'mousemove', 'mouseleave'];
	touchEvents = ['touchstart', 'touchend', 'touchmove'];
	mouseDown;

	mouseUp;
	mouseMove;
	mouseleave;
	isClearAll: boolean = false;
	isFreeHand: boolean = false;
	isNoOnePresenting: boolean = false;
	meetingMemberIds: any;
	chatGuestsIds: any;
	isPortrait: boolean = false;
	imgWidth: number;
	imgHeight: number;
	user: any;
	isResize: boolean = false;
	isOrganiser: boolean = false;
	refresh: boolean = false;
	meetingData = new Meeting();
	public show: boolean = true;
	newMsgChatRoomIds: Array<number> = [];
	markUnread: boolean = false;
	voteStatusesObs: Observable<VoteStatus[]>;
	currentAttachmentObs: Observable<Attachment>;
	currentAttachment: Attachment = new Attachment();
	voteStatuses: Array<VoteStatus> = [];
	loaded: boolean = false;
	showVotesCommentsSidebar: boolean = false;
	showdetatilsSidebar: boolean = false;
	isLessMinute: boolean = false;
	isthreeMinute: boolean = false;
	isMore: boolean = false;
	endPresenting: boolean = false;
	panelActiveIds: Array<any> = [];
	rightArrowCode = 39;
	lefttArrowCode = 37;
	isVoteEnabled: boolean;
	endMeetingSubmitted: boolean = false;
	rightEnum = Right;
	accessRights: Array<any> = new Array<any>();
	accessRightsObs: Observable<any[]>;
	@Input() vote_participants: Array<any> = [];

	votesCommentsSidebarToggle() {
		this.showVotesCommentsSidebar = !this.showVotesCommentsSidebar;
		if (this.showVotesCommentsSidebar) {
			let chatClose = this.el.nativeElement.querySelector('#closeChatBtn');
			chatClose.click();
		}

	}
	showDetatilsSidebarToggle() {
		let chatClose = this.el.nativeElement.querySelector('#closeChatBtn');
		if (chatClose != null) {
			chatClose.click();
		}
		this.showdetatilsSidebar = !this.showdetatilsSidebar;
		// let chatPoup = this.el.nativeElement.querySelector('#chatBox');
		// let toggle = this.el.nativeElement.querySelector('#chatBtn');

		// if (chatPoup.classList.contains('show')) {
		// 	console.log('hii');
		// 	toggle.click();
		// 	  }

	}
	toggle() {
		this.show = !this.show;
	}
	/* Start Swipe Event */
	onSwipe(evt) {
		const x = Math.abs(evt.deltaX) > 40 ? evt.deltaX > 0 ? 'right' : 'left' : '';
		const y = Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? 'down' : 'up') : '';
		if (evt.deltaX > 0) {
			if (this.currentSlide !== 1) {
				this.prevSlide();
			}
		} else if (Math.abs(evt.deltaX) > 40) {
			if (this.currentSlide !== this.presentationSlides.length) {
				this.nextSlide();
			}
		}
	}
	/* End Swipe Event */

	@HostListener('mousewheel', ['$event']) onMousewheel(e) {
		if (this.isPointer) {
			const pointer = document.getElementById('pointer');
			const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
			const rect = canvasEl.getBoundingClientRect();
			const totalHeaderHeigh = this.totalHeaderH();
			let x, y;
			// const rectTop = rect.top < 0 ? 0 : rect.top;
			x = e.pageX - 5 - rect.left;
			y = e.pageY - 5 - totalHeaderHeigh + e.deltaY;

			// Check wheel scroll value in canvas range
			const visibleCanvas = canvasEl.getContext('2d');
			visibleCanvas.rect(0, 0, rect.width, rect.height);

			if (visibleCanvas.isPointInPath(x, y)) {
				pointer.style.left = e.pageX - 5 + 'px';
				pointer.style.top = e.pageY + e.deltaY - 5 + 'px';
				this.firePointerChanges(x, y, rect);
			}
		}

		if (this.isFreeHand === true) {
			const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
			const rect = canvasEl.getBoundingClientRect();
			const totalHeaderHeigh = this.totalHeaderH();
			let x, y;
			x = e.pageX - 5 - rect.left;
			y = e.pageY - 5 - totalHeaderHeigh + e.deltaY;
			this.fireFreeHand(x, y, rect);
		}
	}


	@HostListener('window:resize', ['$event'])
	onResize(event) {
		// this.winWidth = event.target.innerWidth;
		// this.winHeight = event.target.innerHeight;
		// const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

		this.isResize = true;
		this.scaleToFit(this.presentationSlides[this.currentSlide]);
		this.fireSlideChange(this.currentSlide);

	}

	@HostListener('window:keyup', ['$event'])
	keyEvent(event: KeyboardEvent) {
		if (event.keyCode === this.lefttArrowCode && this.currentSlide !== this.presentationSlides.length) {
			this.nextSlide();
		}

		if (event.keyCode === this.rightArrowCode && this.currentSlide !== 1) {
			this.prevSlide();
		}
	}

	reloadPresentation() {
		window.location.reload();
	}
	constructor(
		private el: ElementRef,
		public authNoticeService: AuthNoticeService,
		private route: ActivatedRoute,
		private _translationService: TranslationService,
		private _meetingService: MeetingService,
		private _userService: UserService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private router: Router,
		private _crudService: CrudService,
		private _chatService: ChatService,
		private _roleService: RoleService,
		public toastr: ToastrManager
	) { }


	ngAfterViewInit() {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.cx = canvasEl.getContext('2d');
		canvasEl.style.display = 'block';
		canvasEl.style.margin = '0 auto';
		this.cx.lineWidth = 3;
		this.cx.lineCap = 'round';
		this.cx.strokeStyle = '#000';
		// 	this.setCanvasSize();
	}
	// setCanvasSize() {
	// 	const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
	// 	if (this.isPortrait) {
	// 		canvasEl.width = 595;
	// 		canvasEl.height = 842;
	// 	} else {
	// 		canvasEl.width = 842;
	// 		canvasEl.height = 595;
	// 	}
	// }
	drawNotes() {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.unSubscripeEvents();
		this.isDrawing = true;
		if (this.isDrawing) {
			this.captureEvents(canvasEl);
		} else {
			this.drawingSubscription.unsubscribe();
		}
	}
	showPointer() {
		const pointer = document.getElementById('pointer');
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.unSubscripeEvents();
		this.isPointer = true;
		if (this.isPointer) {
			this.subscription = this.mouseMove.subscribe((e: any) => {
				pointer.style.display = 'block';
				const rect = canvasEl.getBoundingClientRect();
				const totalHeaderHeigh = this.totalHeaderH();
				let x, y;
				if (this.mouseEvents.includes(e.type)) {
					// const rectTop = rect.top < 0 ? 0 : rect.top;
					x = e.pageX - 5 - rect.left;
					y = e.pageY - 5 - totalHeaderHeigh;
					pointer.style.top = e.pageY - 5 + 'px';
					pointer.style.left = e.pageX - 5 + 'px';
				} else if (this.touchEvents.includes(e.type)) {
					x = e.changedTouches[0].clientX - 5 - rect.left;
					y = e.changedTouches[0].clientY - 5 - rect.top;
					pointer.style.top = e.changedTouches[0].clientY - 5 + 'px';
					pointer.style.left = e.changedTouches[0].clientX - 5 + 'px';
				}
				this.firePointerChanges(x, y, rect);
			});

		} else {
			pointer.style.display = 'none';
			this.fireClosePointer();
		}
	}

	unSubscripeEvents() {
		if (this.eraserMoveSubscription) {
			this.eraserMoveSubscription.unsubscribe();
		}
		if (this.eraserDownSubscription) {
			this.eraserDownSubscription.unsubscribe();
		}
		if (this.eraserUpSubscription) {
			this.eraserUpSubscription.unsubscribe();
		}
		if (this.eraserLeaveSubscription) {
			this.eraserLeaveSubscription.unsubscribe();
		}
		if (this.drawingSubscription) {
			this.drawingSubscription.unsubscribe();
		}
		if (this.clickSubscription) {
			this.clickSubscription.unsubscribe();
		}
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		if (this.isEraser) {
			this.isEraser = false;
		}
		if (this.isPointer) {
			this.isPointer = false;
			const pointer = document.getElementById('pointer');
			pointer.style.display = 'none';
			this.fireClosePointer();
		}
		if (this.isText) {
			this.isText = false;
		}
		if (this.isDrawing) {
			this.isDrawing = false;
		}
		if (this.isClearAll) {
			this.isClearAll = false;
		}
		if (this.isFreeHand) {
			this.isFreeHand = false;
		}
	}
	clearAll() {
		this.unSubscripeEvents();
		this.isClearAll = true;
		this.clearAllDrawingsOfCanvas();
		this.fireClearAll();
	}
	freeHand() {
		this.unSubscripeEvents();
		this.isFreeHand = true;
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		if (this.isFreeHand === true) {
			this.subscr = this.mouseMove.subscribe((e: any) => {
				const rect = canvasEl.getBoundingClientRect();
				const totalHeaderHeigh = this.totalHeaderH();
				let x, y;
				if (this.mouseEvents.includes(e.type)) {
					// const rectTop = rect.top < 0 ? 0 : rect.top;
					x = e.pageX - 5 - rect.left;
					y = e.pageY - 5 - totalHeaderHeigh;
				} else if (this.touchEvents.includes(e.type)) {
					x = e.changedTouches[0].clientX - 5 - rect.left;
					y = e.changedTouches[0].clientY - 5 - rect.top;
				}
				this.fireFreeHand(x, y, rect);
			});

		}
	}

	clearAllDrawingsOfCanvas() {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		const drawingData = this.getSlideData();
		drawingData.points = [];
	}
	showEraser() {
		this.unSubscripeEvents();
		this.isEraser = true;
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		if (this.isEraser) {
			this.eraserDownSubscription = this.mouseDown.subscribe((e: any) => {
				this.isDown = true;
			});

			this.eraserUpSubscription = this.mouseUp.subscribe((e: any) => {
				this.isDown = false;
			});
			this.eraserLeaveSubscription = this.mouseleave.subscribe(
				(e: any) => {
					this.isDown = false;
				}
			);
			this.eraserMoveSubscription = this.mouseMove.subscribe((e: any) => {
				const rect = canvasEl.getBoundingClientRect();
				if (this.isDown) {
					let x, y;
					if (this.mouseEvents.includes(e.type)) {
						x = e.clientX - rect.left;
						y = e.clientY - rect.top;
					} else if (this.touchEvents.includes(e.type)) {
						x = e.changedTouches[0].clientX - rect.left;
						y = e.changedTouches[0].clientY - rect.top;
					}
					this.clearDrawOnCanvas(x, y, rect);
					this.fireEraserChanges(x, y, rect);
				}
			});
		}
	}

	clearDrawOnCanvas(x, y, clearRect) {
		const drawingData = this.getSlideData();
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		const rect = canvasEl.getBoundingClientRect();
		drawingData.points.push({
			type: 'erase',
			order: this.order++,
			x: x,
			y: y,
			clearRect: clearRect
		});
		const newX = (x * rect.width) / clearRect.width;
		const newY = (y * rect.height) / clearRect.height;
		const eraserDiameterX =
			(this.eraserDiameter * rect.width) / clearRect.width;
		const eraserDiameterY =
			(this.eraserDiameter * rect.height) / clearRect.height;
		this.cx.clearRect(newX, newY, eraserDiameterX, eraserDiameterY);
	}

	showText() {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.unSubscripeEvents();
		this.isText = true;
		this.clickSubscription = fromEvent(canvasEl, 'click').subscribe(
			(e: MouseEvent) => {
				const rect = canvasEl.getBoundingClientRect();
				this.textPositionX = e.clientX - rect.left;
				this.textPositionY = e.clientY - rect.top;
				this.textRect = rect;
				this.clickSubscription.unsubscribe();
				this.open(this.modalContent);
			}
		);
	}
	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.meetingId = +params['meeting_id'];
		});
		this._chatService.newChatNotificationsIdsUpdate.subscribe((data) => {
			if (data) {
				this.newMsgChatRoomIds = data;
				this.checkUnreadMessages();
			}
		});
		const token = this.route.snapshot.queryParamMap.get('token');
		if (token) {
			localStorage.setItem('accessToken', token);
		}

		this.getAccessRights();
		this.getVoteStauses();
		this.getMeetingPresentationAttachment();
		this.listenToChangePresenterChannel();
		this.listenToEndPresentationChannel();
		this.listenToStartVoteChannel();
		this.listenToEndVoteChannel();
		this.listenToMeetingChangeChannel();
		this.listenToChangeVoteChannel();
		this.listenToJoinToPresentationChannel();
		forkJoin([this.voteStatusesObs, this.currentAttachmentObs, this.accessRightsObs])
			.subscribe(data => {
				this.voteStatuses = data[0];
				this.currentAttachment = data[1];
				this.accessRights = data[2];
				this.loadPresentation();
			});
	}
	prepareParticipants() {
		if (this.meetingData.guests.length > 0) {
			this.vote_participants = this.meetingData.guests.map(g => {
				const participant = new VoteParticipants();
				participant.id = null;
				participant.user_id = null;
				participant.meeting_guest_id = g.meeting_guest_id;
				participant.vote_id = null;
				participant.name = g.full_name ?? g.email;
				return participant;
			});
		}

		if (this.meetingData.meeting_participants.length > 0) {

			this.meetingData.meeting_participants.sort((a, b) => {
				const aOrder = a['order'] ?? a.pivot?.participant_order ?? 0;
				const bOrder = b['order'] ?? b.pivot?.participant_order ?? 0;
				return aOrder - bOrder;
			}).map((item) => {
				// Map logic here
				const participant = new VoteParticipants();
				participant.id = null;
				participant.user_id = item.id;
				participant.meeting_guest_id = null;
				participant.vote_id = null;
				participant.name = item.name_ar;
				this.vote_participants.push(participant);
			});
		}
	}
	loadPresentation(newAttachmentId = null, newAgendaLoad = true) {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		this.currentSlide = 0;

		this.mouseDown = merge(
			fromEvent(canvasEl, 'mousedown'),
			fromEvent(canvasEl, 'touchstart')
		);

		this.mouseUp = merge(
			fromEvent(canvasEl, 'mouseup'),
			fromEvent(canvasEl, 'touchend')
		);
		this.mouseMove = merge(
			fromEvent(canvasEl, 'mousemove'),
			fromEvent(canvasEl, 'touchmove')
		);
		this.mouseleave = merge(
			fromEvent(canvasEl, 'mouseleave'),
			fromEvent(canvasEl, 'touchend')
		);


		this.getLanguage();

		this.route.params.subscribe(params => {
			this.attachmentId = newAttachmentId == null ? (this.currentAttachment.id ? this.currentAttachment.id : +params['attachment_id']) : newAttachmentId;
			this.meetingId = +params['meeting_id'];
			this.meetingAgendaId = +params['meeting_agenda_id'];
			this.checkPresentationMaster(this.meetingId, this.attachmentId);
			this.getPresentationSlides(this.attachmentId);
			this.refresh = true;
			this.getMeetingData(newAgendaLoad);
			this.getAttachment(this.attachmentId);
			forkJoin([
				this.checkPresentationMasterObs,
				this.presentationSlidesObs,
				this.attachmentObs
			]).subscribe(
				data => {
					this.currentSlide++;
					if (data[0].is_master) {
						this.isClient = false;
					} else {
						this.isClient = true;
					}
					this.getCurrentUser();

					this.checkIfOrganiserInMeeting();
					this.presentationSlides = data[1].presentation_images;
					this.attachment = data[2];
					this.meetingMemberIds = data[2].meetingMemberIds;
					this.chatGuestsIds = data[2].chatGuestsIds;
					if (this.attachment.presentation_notes) {
						this.presentationNotes = this.attachment.presentation_notes;
					} else {
						this.presentationNotes = {
							attachment_id: this.attachmentId,
							data: []
						};
						this.presentationSlides?.forEach(
							(presentationSlide, index) => {
								this.presentationNotes.data.push({
									slide_num: index + 1,
									points: []
								});
							}
						);
					}
					if (newAttachmentId != null) {
						this.ngAfterViewInit();
					}
					this.isLoaded = true;
					this.checkForAttachmentPresenter();
				},
				error => { }
			);
		});

		this.freeHand();
	}

	changeMasterToClient() {
		this.isClient = true;
	}


	beforePanelChange(event) {
		if (event.nextState === true) {
			this.panelActiveIds.push(event.panelId);
		} else {
			if (this.panelActiveIds.indexOf(event.panelId) !== -1) {
				this.panelActiveIds.splice(this.panelActiveIds.indexOf(event.panelId), 1);
			}
		}
	}

	getMeetingData(newAgendaLoad = false) {
		let currentAgenda = new MeetingAgenda;
		if (this.meetingData.current_agenda) {
			currentAgenda = JSON.parse(JSON.stringify(this.meetingData.current_agenda));

		}
		this._meetingService.getMeetingAllDataForPresentation<Meeting>(this.meetingId, this.attachmentId).subscribe(res => {
			this.meetingData = res;
			this.prepareParticipants();
			if (newAgendaLoad === true) {
				this.meetingData.current_agenda.isShowMore = false;
				this.meetingData.current_agenda.commentsMax = 2;
			} else {
				this.meetingData.current_agenda.isShowMore = currentAgenda.isShowMore;
				this.meetingData.current_agenda.commentsMax = currentAgenda.commentsMax;
			}
			if (this.refresh === true) {
				this.refresh = false;
				this.panelActiveIds = [];
				if (this.meetingData.current_agenda.agenda_votes.length > 0) {
					this.panelActiveIds.push('ngb-panel-votes-' + this.meetingData.current_agenda.agenda_votes[0].id);
				}
			}

			if (this.voteMenuMenu !== undefined) {
				if (this.voteMenuMenu.addNewComment === true) {
					this.meetingData.current_agenda.isShowMore = true;
					this.meetingData.current_agenda.commentsMax = 2;
					const commentsLen = this.meetingData.current_agenda.agenda_user_comments.length;
					this.voteMenuMenu.toggle(commentsLen, this.meetingData.current_agenda);
					this.voteMenuMenu.addNewComment = false;
				}
			}

			this.loaded = true;
		});
	}


	listenToChangePresenterChannel() {
		window.Echo.channel('changePresenter').listen(
			'.ChangePresenterEvent',
			data => {
				const meetingMemberIds = data.data.meetingMemberIds;
				const meetingGuestIds = data.data.meetingGuestIds;
				let isExist = false;
				this.findUser(meetingMemberIds, this.userId).subscribe(
					res => {
						if (res) {
							isExist = true;
						}
					},
					error => { }
				);

				if (!isExist) {
					this.findUser(meetingGuestIds, this.user.meeting_guest_id).subscribe(
						res => {
							if (res) {
								isExist = true;
							}
						},
						error => { }
					);
				}

				if (isExist) {
					const attachmentId = +data.data.attachment_id;

					this.attachment = data.data.attachment;
					if (this.attachment.presenter_meeting_guest_id != null) {
						if (this.attachment.presenter_meeting_guest_id === this.userId) {
							this.isClient = false;
						} else if (this.attachment.presenter_meeting_guest_id !== this.userId && this.attachment.presenter_meeting_guest_id) {
							this.isClient = true;
						}
					} else {
						if (this.attachment.presenter_id === this.userId) {
							this.isClient = false;
						} else if (this.attachment.presenter_id !== this.userId && this.attachment.presenter_id) {
							this.isClient = true;
						}
					}
					this.unSubscripeEvents();
					this.checkForAttachmentPresenter();
				}
			},
			e => { }
		);
	}

	listenToMeetingChangeChannel() {
		window.Echo.channel('meetingDataChanged').listen(
			'.MeetingDataChangedEvent',
			data => {
				this.getMeetingData();
			}, e => { }
		);
	}

	listenToStartVoteChannel() {
		window.Echo.channel('startVote').listen(
			'.StartVoteEvent',
			data => {
				this.getMeetingData();
			}, e => { }
		);
	}

	listenToEndVoteChannel() {
		window.Echo.channel('endVote').listen(
			'.EndVoteEvent',
			data => {
				this.getMeetingData();
			}, e => { }
		);
	}

	listenToChangeVoteChannel() {
		window.Echo.channel('changeVote').listen(
			'.ChangeVoteEvent',
			data => {
				this.getMeetingData();
			}, e => { }
		);
	}

	loadData() {
		const slideDrawings = this.getSlideData();
		slideDrawings.points.forEach(slideData => {
			if (slideData.type === 'draw') {
				this.drawOnCanvas(
					slideData.prevPos,
					slideData.currentPos,
					slideData.drawRect
				);
			} else if (slideData.type === 'draw_text') {
				this.drawTextonCanvas(
					slideData.text,
					slideData.textPositionX,
					slideData.textPositionY,
					slideData.textRect
				);
			} else if (slideData.type === 'erase') {
				this.clearDrawOnCanvas(
					slideData.x,
					slideData.y,
					slideData.clearRect
				);
			}
		});

	}

	checkForAttachmentPresenter() {
		if (this.attachment.presenter) {
			if (this.isArabic) {
				this.attachment.presenter.name_ar
					? (this.presenterName =
						this.attachment.presenter.name_ar + '')
					: (this.presenterName =
						this.attachment.presenter.name + '');
			} else {
				// tslint:disable-next-line:max-line-length
				this.attachment.presenter.name
					? (this.presenterName =
						this.attachment.presenter.name + '')
					: (this.presenterName =
						this.attachment.presenter.name_ar + '');
			}
			this.presenterUserId = this.attachment.presenter.id;
			this.isNoOnePresenting = false;
		} else if (this.attachment.presenter_guest) {
			this.presenterName = this.attachment.presenter_guest.full_name ?? this.attachment.presenter_guest.email;
			this.presenterUserId = this.attachment.presenter_guest.id;
			this.isNoOnePresenting = false;
		} else {

			this.presenterUserId = null;
			this.isNoOnePresenting = true;
		}
	}

	getPresentationSlides(attachmentId) {
		this.presentationSlidesObs = this._meetingService.getPresentationSlides(
			attachmentId
		);
	}

	checkPresentationMaster(meetingId, attachmentId) {
		this.checkPresentationMasterObs = this._meetingService.checkPresentationMaster(
			meetingId,
			attachmentId
		);
	}

	getAttachment(attachmentId) {
		this.attachmentObs = this._meetingService.getAttachment(attachmentId);
	}

	private captureEvents(canvasEl: HTMLCanvasElement) {
		// this will capture all mousedown events from the canvas element
		this.drawingSubscription = this.mouseDown
			.pipe(
				switchMap(e => {
					// after a mouse down, we'll record all mouse moves
					return this.mouseMove.pipe(
						// we'll stop (and unsubscribe) once the user releases the mouse
						// this will trigger a 'mouseup' event
						takeUntil(this.mouseUp),
						// we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
						takeUntil(this.mouseleave),
						// pairwise lets us get the previous value to draw a line from
						// the previous point to the current point
						pairwise()
					);
				})
			)
			.subscribe((res: [any, any]) => {
				const rect = canvasEl.getBoundingClientRect();
				let prevPos;
				let currentPos;

				if (this.mouseEvents.includes(res[0].type)) {
					prevPos = {
						x: res[0].clientX - rect.left,
						y: res[0].clientY - rect.top
					};
					currentPos = {
						x: res[1].clientX - rect.left,
						y: res[1].clientY - rect.top
					};
				} else if (this.touchEvents.includes(res[0].type)) {
					prevPos = {
						x: res[0].changedTouches[0].clientX - rect.left,
						y: res[0].changedTouches[0].clientY - rect.top
					};
					currentPos = {
						x: res[1].changedTouches[0].clientX - rect.left,
						y: res[1].changedTouches[0].clientY - rect.top
					};
				}
				this.fireDrawNotesChanges(prevPos, currentPos, rect);

				// this method we'll implement soon to do the actual drawing
				this.drawOnCanvas(prevPos, currentPos, rect);
			});
	}

	private drawOnCanvas(
		prevPos: { x: number; y: number },
		currentPos: { x: number; y: number },
		drawRect,
		isSocket = false
	) {
		if (!this.cx) {
			return;
		}
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		const rect = canvasEl.getBoundingClientRect();

		const newPrevPos = { x: 0, y: 0 };
		const newCurrentPos = { x: 0, y: 0 };
		newPrevPos.x = (prevPos.x * rect.width) / drawRect.width;
		newPrevPos.y = (prevPos.y * rect.height) / drawRect.height;

		newCurrentPos.x = (currentPos.x * rect.width) / drawRect.width;
		newCurrentPos.y = (currentPos.y * rect.height) / drawRect.height;

		if (isSocket === true) {
			this.checkBoundries(newCurrentPos.x, newCurrentPos.y);
		}

		this.cx.beginPath();
		if (prevPos) {
			this.cx.moveTo(newPrevPos.x, newPrevPos.y); // from
			this.cx.lineTo(newCurrentPos.x, newCurrentPos.y);
			this.cx.stroke();
			const drawingData = this.getSlideData();
			drawingData.points.push({
				type: 'draw',
				order: this.order++,
				currentPos: currentPos,
				prevPos: prevPos,
				drawRect: drawRect
			});
		}
	}

	private getSlideData() {
		return this.presentationNotes.data.filter(
			presentationNoteData =>
				presentationNoteData.slide_num === this.currentSlide
		)[0];
	}

	endPresentation() {
		const _title: string = this.translate.instant('PRESENTATION.END.ENDPRESENTATION');
		const _description: string = this.translate.instant('PRESENTATION.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('PRESENTATION.END.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('PRESENTATION.END.DELETEMESSAGE');
		this.layoutUtilsService.logOut();
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption,
			this.translate.instant('PRESENTATION.END_PRESENTATION'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.fireClosePointer();
			this.endPresenting = true;
			this._meetingService
				.endPresentation(this.meetingId, this.attachmentId)
				// tslint:disable-next-line:no-shadowed-variable
				.subscribe(res => {

				});
		});


	}
	getCurrentUser() {
		this._userService.getCurrentUser().subscribe(
			res => {
				this.userId = res.user.id;
				this.user = res.user;
				this.isVoteEnabled = this.user.organization.is_vote_enabled;
				this.listenToJoinToSlideNotesChannel();
			},
			error => { }
		);
	}

	checkIfOrganiserInMeeting() {
		this._meetingService.checkIfOrganiserInMeeting(this.meetingId).subscribe(
			res => {
				this.isOrganiser = res;
			},
			error => { }
		);
	}

	open(content) {
		this.textNotes = '';
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then(
			result => {
				this.closeResult = `Closed with: ${result}`;
			},
			reason => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

	save(memberForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (memberForm.valid) {
			// submit form if valid

			this.close();
		} else {
			this.submitted = false;
		}
	}

	hasError(memberForm: NgForm, field: string, validation: string) {
		if (
			memberForm &&
			Object.keys(memberForm.form.controls).length > 0 &&
			memberForm.form.controls[field].errors &&
			validation in memberForm.form.controls[field].errors
		) {
			if (validation) {
				return (
					(memberForm.form.controls[field].dirty &&
						memberForm.form.controls[field].errors[validation]) ||
					(this.edit &&
						memberForm.form.controls[field].errors[validation])
				);
			}
			return (
				(memberForm.form.controls[field].dirty &&
					memberForm.form.controls[field].invalid) ||
				(this.edit && memberForm.form.controls[field].invalid)
			);
		}
	}

	close() {
		this.submitted = false;
		this.edit = false;
	}



	scaleToFit(src) {
		const image = new Image();
		image.src = this.imagesBaseURL + src;

		const indexNum = this.presentationSlides.findIndex(element => {
			return element === src;
		});
		this.currentSlide = indexNum + 1;
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;


		this.imgWidth = image.width != 0 ? image.width : this.imgWidth;
		this.imgHeight = image.height != 0 ? image.height : this.imgHeight;

		this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		canvasEl.style.background = 'url(' + this.imagesBaseURL + src + ')';
		canvasEl.style.backgroundSize = 'contain';
		canvasEl.style.backgroundRepeat = 'no-repeat';
		canvasEl.style.backgroundPosition = 'center';

		if (this.imgWidth <= window.innerWidth) {
			canvasEl.width = this.imgWidth * .8;
		} else {
			canvasEl.width = window.innerWidth * .8;
		}

		canvasEl.height = (this.imgHeight * canvasEl.width) / this.imgWidth;

		this.loadData();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
	nextSlide() {
		this.scaleToFit(this.presentationSlides[this.currentSlide]);
		this.fireSlideChange(this.currentSlide);
	}
	prevSlide() {
		this.scaleToFit(this.presentationSlides[this.currentSlide - 2]);
		this.fireSlideChange(this.currentSlide);
	}

	goToSlide(slideNum) {
		this.scaleToFit(this.presentationSlides[slideNum - 1]);
	}

	drawTextonCanvas(text, textPositionX, textPositionY, textRect, isSocket = false) {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		const rect = canvasEl.getBoundingClientRect();
		const x = (textPositionX * rect.width) / textRect.width;
		const y = (textPositionY * rect.height) / textRect.height;
		this.cx.beginPath();
		if (isSocket === true) {
			this.checkBoundries(x, y);
		}
		const fontSize = (18 * rect.width) / textRect.width + 'px';
		this.cx.font = 'italic ' + fontSize + ' Arial';
		this.cx.textAlign = 'center';
		this.cx.textBaseline = 'middle';
		this.cx.fillStyle = 'red';
		this.cx.fillText(text, x, y);
		this.cx.rect(0, 0, canvasEl.width, canvasEl.height);


		const drawingData = this.getSlideData();
		drawingData.points.push({
			type: 'draw_text',
			order: this.order++,
			textPositionX: textPositionX,
			textPositionY: textPositionY,
			textRect: textRect,
			text: text
		});
	}

	listenToEndPresentationChannel() {
		window.Echo.channel('endPresentation')
			.listen('.EndPresentationEvent', (data) => {
				const userAgent = window.navigator.userAgent.toLowerCase();
				const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
				if (!isTablet) {
					const url = 'view-meetings/' + this.meetingId;
					window.open(url, '_self');
				}
			}, (e) => {

			});
	}

	backToMeeting() {
		this.router.navigate(['/view-meetings', this.meetingId], { queryParams: { exit: true } });
	}

	listenToJoinToPresentationChannel() {
		window.Echo.channel('changePresentedAttachment')
			.listen('.ChangePresentedAttachmentEvent', (data) => {
				const meetingMemberIds = data.data.meetingMemberIds;
				const meetingGuestIds = data.data.meetingGuestIds;
				const meetingOrganisersIds = data.data.meetingOrganisersIds;
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

					this.loadPresentation(attachmentId);
				}

				/**/
			}, (e) => {

			});

	}


	listenToJoinToSlideNotesChannel() {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		window.Echo.channel('slideNotes').listen(
			'.SlideNotesEvent',
			data => {
				if ((this.userId !== data.data.createdBy)) {
					const attachmentId = data.data.attachmentId;
					if (attachmentId === this.attachment.id) {
						const meetingMemberIds = data.data.meetingMemberIds;
						const chatGuestsIds = data.data.chatGuestsIds;
						let isExist = false;
						this.findUser(meetingMemberIds, this.userId).subscribe(
							res => {
								if (res) {
									isExist = true;
								}
							},
							error => { }
						);

						if (!isExist) {
							this.findUser(chatGuestsIds, this.user.meeting_guest_id).subscribe(
								res => {
									if (res) {
										isExist = true;
									}
								},
								error => { }
							);
						}

						if (isExist) {
							if (data.data.key === 'slide_changed') {
								const slideNum = data.data.slide_num;
								this.goToSlide(slideNum);
							} else if (
								data.data.key === 'pointer_changed'
							) {
								const pointer = document.getElementById(
									'pointer'
								);

								const rect = canvasEl.getBoundingClientRect();
								const totalHeaderHeigh = this.totalHeaderH();
								pointer.style.display = 'block';
								const x =
									(data.data.position_x * rect.width) /
									data.data.rect.width + rect.left;
								const rectTop = rect.top < 0 ? totalHeaderHeigh : rect.top + window.scrollY;
								const y =
									(data.data.position_y * rect.height) /
									data.data.rect.height + rectTop;
								pointer.style.top = y + 'px';
								pointer.style.left = x + 'px';

								// scroll
								const xPositionInCanvas = (data.data.position_x * rect.width) / data.data.rect.width;
								const yPositionInCanvas = (data.data.position_y * rect.height) / data.data.rect.height;

								this.cx.beginPath();
								this.checkBoundries(xPositionInCanvas, yPositionInCanvas);

							} else if (
								data.data.key === 'hand_moved'
							) {
								const rect = canvasEl.getBoundingClientRect();
								// scroll
								const xPositionInCanvas = (data.data.position_x * rect.width) / data.data.rect.width;
								const yPositionInCanvas = (data.data.position_y * rect.height) / data.data.rect.height;

								this.cx.beginPath();
								this.checkBoundries(xPositionInCanvas, yPositionInCanvas);

							} else if (data.data.key === 'pointer_closed') {
								const pointer = document.getElementById(
									'pointer'
								);
								pointer.style.display = 'none';
							} else if (
								data.data.key === 'draw_notes_changed'
							) {
								const rect = canvasEl.getBoundingClientRect();
								const prevPos = data.data.prevPos;
								const currentPos = data.data.currentPos;
								const drawRect = data.data.drawRect;
								const currentSlide = data.data.currentSlide;

								if (currentSlide === this.currentSlide) {
									this.drawOnCanvas(
										prevPos,
										currentPos,
										drawRect,
										true
									);
								}
							} else if (
								data.data.key === 'draw_text_notes'
							) {
								const text = data.data.text;
								const textPositionX =
									data.data.textPositionX;
								const textPositionY =
									data.data.textPositionY;
								const textRect = data.data.textRect;
								this.drawTextonCanvas(
									text,
									textPositionX,
									textPositionY,
									textRect,
									true
								);
							} else if (data.data.key === 'eraser_changes') {
								const rect = canvasEl.getBoundingClientRect();
								const x = data.data.position_x;
								const y = data.data.position_y;
								const eraserRect = data.data.eraserRect;
								const currentSlide = data.data.currentSlide;

								// scroll
								this.cx.beginPath();
								this.checkBoundries(x, y);

								if (currentSlide === this.currentSlide) {
									this.clearDrawOnCanvas(x, y, eraserRect);
								}

							} else if (data.data.key === 'clear_all') {
								this.clearAllDrawingsOfCanvas();
							}
						}
					}
				}
			},
			e => {

			}
		);
	}

	totalHeaderH() {
		return document.getElementById('headerHeigh').clientHeight +
			parseInt(window.getComputedStyle(document.getElementById('headerHeigh')).marginBottom) +
			document.getElementById('fixedHeader').clientHeight +
			parseInt(window.getComputedStyle(document.getElementById('fixedHeader')).marginBottom);
	}

	checkBoundries(x, y) {
		const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
		const rect = canvasEl.getBoundingClientRect();
		const canvasHeight = canvasEl.clientHeight;
		const windowHeight = window.innerHeight;
		const visibleHeight = Math.max(0, rect.top > 0 ? Math.min(canvasHeight, windowHeight - rect.top) : Math.min(rect.bottom, windowHeight));
		const scrollTop = window.scrollY;

		const headerHeigh = document.getElementById('headerHeigh').clientHeight +
			parseInt(window.getComputedStyle(document.getElementById('headerHeigh')).marginBottom);
		const visibleCanvas = canvasEl.getContext('2d');

		let removedHeaderHeigh = 0;
		if (scrollTop > headerHeigh) {
			removedHeaderHeigh = headerHeigh;
		}
		visibleCanvas.rect(0, scrollTop - headerHeigh, rect.width, visibleHeight - removedHeaderHeigh);

		if (!visibleCanvas.isPointInPath(x, y)) {
			window.scrollTo(x, y);
		}
	}

	findUser(meetingMemberIds, userId) {
		const users = meetingMemberIds.filter(
			meetingMemberId => meetingMemberId === userId
		);
		if (users.length) {
			return of(true);
		} else {
			return of(false);
		}
	}

	fireDrawText(textForm) {
		this.submitted = true;
		this.edit = true;

		if (textForm.valid) {
			// submit form if valid
			const data = {
				key: 'draw_text_notes',
				text: this.textNotes,
				textPositionX: this.textPositionX,
				textPositionY: this.textPositionY,
				textRect: this.textRect,
				presentation_notes: this.presentationNotes
			};
			this.drawTextonCanvas(
				this.textNotes,
				this.textPositionX,
				this.textPositionY,
				this.textRect
			);
			this.publishEvent(data);
			this.close();
		} else {
			this.submitted = false;
		}
	}

	fireSlideChange(slideNum) {
		const data = { key: 'slide_changed', slide_num: slideNum };
		this.publishEvent(data);
	}

	fireFreeHand(positionX, positionY, rect) {
		positionX = positionX < 0 ? 0 : positionX;
		positionY = positionY < 0 ? 0 : positionY;
		const data = {
			key: 'hand_moved',
			position_x: positionX,
			position_y: positionY,
			rect: rect
		};
		this.publishEvent(data);
	}

	fireClearAll() {
		const data = {
			key: 'clear_all',
			presentation_notes: this.presentationNotes
		};
		this.publishEvent(data);
	}

	firePointerChanges(positionX, positionY, rect) {
		positionX = positionX < 0 ? 0 : positionX;
		positionY = positionY < 0 ? 0 : positionY;
		const data = {
			key: 'pointer_changed',
			position_x: positionX,
			position_y: positionY,
			rect: rect
		};
		this.publishEvent(data);
	}

	fireEraserChanges(positionX, positionY, eraserRect) {
		const data = {
			key: 'eraser_changes',
			position_x: positionX,
			position_y: positionY,
			eraserRect: eraserRect,
			presentation_notes: this.presentationNotes
		};
		this.publishEvent(data);
	}

	fireDrawNotesChanges(prevPos, currentPos, drawRect) {
		const data = {
			key: 'draw_notes_changed',
			prevPos: prevPos,
			currentPos: currentPos,
			drawRect: drawRect,
			presentation_notes: this.presentationNotes
		};
		this.publishEvent(data);
	}

	fireClosePointer() {
		const data = { key: 'pointer_closed' };
		this.publishEvent(data);
	}



	publishEvent(data) {
		data.attachmentId = this.attachment.id;
		data.meetingMemberIds = this.meetingMemberIds;
		data.chatGuestsIds = this.chatGuestsIds;
		data.currentSlide = this.currentSlide;

		if ((this.userId === this.presenterUserId) || this.isOrganiser) {
			this._meetingService
				.broadCastPresentationSlideNotes(this.attachmentId, data)
				.subscribe(
					res => {

					},
					error => { }
				);
		}
	}

	getVoteStauses() {
		this.voteStatusesObs = this._crudService.getList('admin/vote-statuses');
	}

	handleEvent(e) {
		if (e.left <= 60000) {
			this.isthreeMinute = false;
			this.isMore = false;
			this.isLessMinute = true;

		} else if (e.left <= 180000) {
			this.isLessMinute = false;
			this.isMore = false;
			this.isthreeMinute = true;

		} else {
			this.isthreeMinute = false;
			this.isLessMinute = false;
			this.isMore = true;

		}
		if (e.action === 'finished') {
			if (this.meetingData.current_agenda.extraTime === 0) {
				this.meetingData.current_agenda.extraTime = 1;
			}
		}
	}

	endMeeting() {
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');
		this.layoutUtilsService.logOut();

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			//this.fireClosePointer();
			const data = { 'id': this.meetingId };
			this.sendEndMeetingRequest(this.meetingId, data);
		});
	}

	sendEndMeetingRequest(meetingId, data) {
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.END.SUCCESSMESSAGE');
		this.endMeetingSubmitted = true;
		this._meetingService.endMeeting(meetingId, data).
			subscribe(pagedData => {
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.endMeetingSubmitted = false;
				const userAgent = window.navigator.userAgent.toLowerCase();
				const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
				if (!isTablet) {
					this.router.navigate(['/view-meetings', this.meetingId]);
				}
			},
				error => {
					if (error.is_current_presenation) {
						this.endMeetingSubmitted = false;
						const currentPresentationId = error.current_attachment_id;
						this.showCurrentPresentationPopup(meetingId, currentPresentationId);
					}
				});
	}

	showCurrentPresentationPopup(meetingId, currentPresentationId) {
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION_CURRENT_PRESENTATION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.END.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const data = { 'id': meetingId, 'currentPresentationId': currentPresentationId };
			this.sendEndMeetingRequest(meetingId, data);
		});
	}

	getMeetingPresentationAttachment() {
		this.currentAttachmentObs = this._meetingService.getMeetingPresentationAttachment(this.meetingId);
	}
	// closeChat(){
	// 	let chatPoup = this.el.nativeElement.querySelector('#chatBoxCon');
	// 	let toggle = this.el.nativeElement.querySelector('#chatBtn');
	// 	console.log(chatPoup.classList +'classes');
	// 	if (!chatPoup.classList.contains('hidden')) {
	// 		debugger;
	// 		console.log(chatPoup.classList+'classes added');
	// 		toggle.click();
	// 		  }
	// }

	checkUnreadMessages() {
		if (this.meetingData) {
			let index = this.newMsgChatRoomIds.findIndex(chatRoomId => chatRoomId == this.meetingData.chat_room_id);
			if (index > -1) {
				this.markUnread = true;
			}
		}
	}

	markMessageAsReaded() {
		this.markUnread = false;
		this._chatService.removeReadChatNotificationsId(this.meetingData.chat_room_id);
	}

	HasAccessToRight(rightID) {
		return this.accessRights.find(item => item.id == rightID) != null;
	}

	getAccessRights() {
		this.accessRightsObs = this._roleService.getAllRoleAccessRights();
	}

}
