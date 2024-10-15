import {
	Component, Renderer2, OnInit, ViewChild, ChangeDetectionStrategy,
	ElementRef, AfterViewInit, HostListener, TemplateRef, ViewChildren, QueryList,
	Output, EventEmitter, Input
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, fromEvent, Subscription, merge, Observable, map, } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';

import { TranslationService } from '../../../../core/services/translation.service';
import { CrudService } from '../../../../core/services/shared/crud.service';

import { environment } from '../../../../../environments/environment';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as $ from 'jquery';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { DocumentStatuses } from '../../../../core/models/enums/document-statuses';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../core/services/security/users.service';
import { User } from '../../../../core/models/user';
import { ApprovalService } from '../../../../core/services/approval/approval.service';
import { Approval } from '../../../../core/models/approval';
import { debounce } from 'lodash';

@Component({
	selector: 'm-approval-step-two',
	templateUrl: './approval-step-two.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [NgbActiveModal]
})
export class ApprovalStepTwoComponent implements OnInit, AfterViewInit {

	showCursor: boolean = false;
	showRevisionsMenu: boolean = false;
	activeTab: string;
	@ViewChildren('myCanvas', { read: ElementRef }) canvases: QueryList<ElementRef>;
	@ViewChild('content') modalContent: TemplateRef<any>;
	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Output() modalTabChange: EventEmitter<object> = new EventEmitter();
	@Input() popupApprovalId: number;

	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;
	closeResult: string;
	isArabic: boolean;
	approvalId: number;
	documentObs: Observable<Approval>;
	document: Approval = new Approval();
	approval: Approval = new Approval();
	committeeUsers: Array<any> = [];
	documentSlides: any;
	imagesBaseURL = environment.imagesBaseURL;
	cxs: Array<CanvasRenderingContext2D> = [];
	currentSlide: number = 1;
	textNotes: string = '';
	isDrawing: boolean = false;
	isAddText: boolean = false;
	clickSubscription: Subscription;
	textPositionX: number;
	textPositionY: number;
	attachmentObs: any;
	attachment: any;
	isLoaded: boolean = false;
	mouseDown;
	mouseUp;
	mouseMove;
	mouseleave;
	isFreeHand: boolean = false;
	imgWidth: number = 1200;
	imgHeight: number = 1700;
	public show: boolean = true;
	documenSlidesObs: Observable<any>;
	addedAllMembers: boolean = false
	loaded: boolean = false;
	documentStatusEnm = DocumentStatuses;
	colors: Array<string> = ['#FFF15B', '#90F2F1', '#FFB3CF', '#BEF6D0', ' #D3A7FE'];
	userObs: Observable<any>;
	user: User = new User();
	cursorSign: any;
	canArea: any;
	// @HostListener('document:mousemove', ['$event']).onmousemove;
	globalListenFunc: Function;
	assigneeId;
	assignedMemberName;
	signaturesMap = [];
	canvasEl: any;
	allUsers = [];
	node;
	signBtnImg = new Image();

	constructor(
		private renderer: Renderer2,
		public authNoticeService: AuthNoticeService,
		private route: ActivatedRoute,
		private _translationService: TranslationService,
		private modalService: NgbModal,
		private router: Router,
		private _userService: UserService,
		private translate: TranslateService,
		private _approvalService: ApprovalService,
		private _crudService: CrudService,
		public activeModal: NgbActiveModal,
		public _modal: NgbModal,
		private layoutUtilsService: LayoutUtilsService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.approvalId = +params['id']; // (+) converts string 'id' to a number
				this.handleOnInti();
			} else if (this.popupApprovalId != null) {
				this.approvalId = +this.popupApprovalId; // (+) converts string 'id' to a number
				this.handleOnInti();
			}
		});
		this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeTab = queryParams.activeTab;
			}
		});

		this.node = document.getElementById('my-node');
	}

	handleOnInti() {
		this.loadDocument();
		this.getDocument();
		// this.getApprovalMembers();
		this.getCurrentUser();
		this.getDocumentSlides();
		forkJoin([this.userObs, this.documenSlidesObs])
			.subscribe(data => {
				// this.document = data[0];

				this.user = data[0].user;
				this.documentSlides = data[1].document_images_with_size;
				this.isLoaded = true;
				this.cursorSign = document.querySelector<HTMLElement>('.sign-cursor-btn');
				const updateCursorPosition = (event) => {
					const bounds = this.canArea.getBoundingClientRect();
					const cursorBounds = this.cursorSign.getBoundingClientRect();
					this.cursorSign.style.top = `${event.layerY >= bounds.height - cursorBounds.height
						? event.layerY - cursorBounds.height : event.layerY}px`;
					this.cursorSign.style.left = `${event.layerX >= bounds.width - cursorBounds.width
						? event.layerX - cursorBounds.width : event.layerX}px`;
				};
				this.canArea = document.querySelector<HTMLElement>('.add-signature-field-canvas');
				this.canArea.addEventListener('mousemove', debounce((event) => {
					updateCursorPosition(event);
				}, 5));
			});
	}

	ngAfterViewInit() {
		this.canvases.forEach((canvas, index) => {
			const canvasEl: HTMLCanvasElement = canvas.nativeElement;
			this.cxs[index] = canvasEl.getContext('2d');
			canvasEl.style.display = 'block';
			canvasEl.style.margin = '0 auto';
			this.setCanvasRenderingContext2D(canvasEl, index);
			this.cxs[index].lineWidth = 3;
			this.cxs[index].lineCap = 'round';
			this.cxs[index].strokeStyle = '#000';
		});
		this.documentObs.subscribe(res => {
			this.committeeUsers = res.members;
			this.allUsers = res.members.slice();
			this.committeeUsers.forEach(user => {
				user.name = user.name ? user.name : user.name_ar;
			});
			this.approval = res;
			if (this.committeeUsers.find(x => x.signature_x_upper_left == null) != null) {
				this.addedAllMembers = false;
			} else {
				this.addedAllMembers = true;
			}
			this.prepareToDrawingPoints();
		});
	}

	getCurrentUser() {
		this.userObs = this._userService.getCurrentUser();
	}


	getDocument() {
		this.documentObs = this._crudService.get<Approval>('admin/approvals', this.approvalId);
	}

	prepareToDrawingPoints() {
		this.committeeUsers.forEach((member: any, index) => {
			let canvasEl;
			setTimeout(() => {
				if (member.signature_page_number) {
					canvasEl = this.canvases.find((canvas, key) => key == member.signature_page_number - 1).nativeElement;
				}
				if (member.signature_x_upper_left) {
					const point = {
						'id': member.id,
						'x': (((parseFloat(member.signature_x_upper_left) + 15) * canvasEl.width) / 100),
						'xPercentage': member.signature_x_upper_left,
						'y': (((parseFloat(member.signature_y_upper_left) - 1) * canvasEl.height) / 100),
						'yPercentage': member.signature_y_upper_left,
						'slide': member.signature_page_number - 1,
						'name': member.name,
						'name_ar': member.name_ar
					};
					this.committeeUsers.splice(this.committeeUsers.findIndex(x => x.id === member.id), 1);
					this.signaturesMap.push(point);
					this.drawPointIntoCanvas(point, canvasEl.nativeElement);
				}
			}, 500);

		});
	}

	drawPointIntoCanvas(point, canvasEl) {
		this.drawSignatureImage(canvasEl, this.isArabic ? point.name_ar : point.name, point.x, point.y, point.slide);
	}

	toggle() {
		this.show = !this.show;
	}

	addField(member) {
		this.showCursor = true;
		this.assignedMemberName = this.isArabic ? member.name_ar : member.name;
		this.assigneeId = member.id;
		this.removeObjectWithId(this.committeeUsers, this.assigneeId);
		this.layoutUtilsService.showActionNotification(this.translate.instant('APPROVAL.ADD.ADD_FIELLD_NOTE'), MessageType.Read);
		this.isAddText = true;
	}


	removeObjectWithId(arr, id) {
		const objWithIdIndex = arr.findIndex((obj) => obj.id === id);
		if (objWithIdIndex > -1) {
			arr.splice(objWithIdIndex, 1);
		}
		return arr;
	}
	checkAllMembersAssigned() {
		if (this.allUsers.length == this.signaturesMap.length) {
			this.addedAllMembers = true;
		}
	}

	getDocumentSlides() {
		this.documenSlidesObs = this._approvalService.getApprovalSlides(this.approvalId);
	}

	loadDocument(newapprovalId = null) {

		this.getLanguage();
	}

	loadData(index) {
		const canvasEl = this.canvases.find((canvas, key) => key == index).nativeElement;
		this.canvasEl = canvasEl;
		this.fireClickEventForCanvas(canvasEl, index);
		this.fireMouseDownEventForCanvas(canvasEl, index);
		this.drawPointsIntoCanvas(canvasEl);
	}

	drawSignatureImage(canvasEl, text, x, y, slide) {
		const img = new Image();
		img.src = './assets/app/media/img/signature/signaturePen.svg';
		img.addEventListener('load', (e) => {
			this.drawTextonCanvas(text, x, y, slide, canvasEl, img);
		});
	}


	open(content) {
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}

	openSummary() {
		this.submitted = true;
		this._approvalService.updateApprovalMembers(this.signaturesMap).subscribe(res => {
			this.tabChanged.emit('TAB3');
			this.modalTabChange.emit({ TabId: 'close' });
		}, err => {
			this.submitted = false;
		});
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



	close() {
		this.submitted = false;
		this.edit = false;
		this.textNotes = '';
	}

	scaleToFit(slide, index) {
		const image = new Image();
		image.src = this.imagesBaseURL + slide.url;

		image.addEventListener('load', (e) => {
			const indexNum = this.documentSlides.findIndex((element) => {
				return element.url === slide.url;
			});
			const canvasEl: HTMLCanvasElement = this.canvases.find((canvas, key) => index == key).nativeElement;

			this.imgWidth = slide.width;
			this.imgHeight = slide.height;

			// this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			canvasEl.style.background = 'url(' + this.imagesBaseURL + slide.url + ')';
			canvasEl.style.backgroundSize = 'contain';
			canvasEl.style.backgroundRepeat = 'no-repeat';
			canvasEl.style.backgroundPosition = 'center';

			canvasEl.width = window.innerWidth * 0.8;

			canvasEl.height = (this.imgHeight * canvasEl.width) / this.imgWidth;
			this.loadData(index);
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	drawTextonCanvas(text, textPositionX, textPositionY, canvasIndex, canvasElements, img) {
		const canvasEl: HTMLCanvasElement = this.canvases.find((canvas, key) => canvasIndex == key).nativeElement;
		const rect = canvasEl.getBoundingClientRect();
		const x = textPositionX;
		const y = textPositionY;
		this.setCanvasRenderingContext2D(canvasEl, canvasIndex);
		this.cxs[canvasIndex].beginPath();
		let signature = this.signaturesMap.find(signature => signature.id == this.assigneeId);
		this.signaturesMap.forEach(signature => {
			if (signature.id == this.assigneeId) {
				this.cxs[signature.slide].clearRect(signature.x - 40, signature.y - 2, text.length > 13 ? 265 : 180, 55);
				signature.slide = canvasIndex;
				signature.x = x;
				signature.xPercentage = (this.textPositionX / canvasElements.width) * 100;
				signature.y = y;
				signature.yPercentage = (this.textPositionY / canvasElements.height) * 100
			}
		})

		if (this.assigneeId && !signature) {
			signature = {
				'id': this.assigneeId, 'x': this.textPositionX, 'xPercentage': (this.textPositionX / canvasElements.width) * 100,
				'y': this.textPositionY, 'yPercentage': (this.textPositionY / canvasElements.height) * 100,
				'slide': this.currentSlide - 1, 'name': text, 'name_ar': text
			};
			this.signaturesMap.push(signature)
			this.checkAllMembersAssigned();
		}


		if (text.length > 13) {
			this.cxs[canvasIndex].drawImage(img, parseFloat(x) - 30, parseFloat(y), 255, 41);
			this.cxs[canvasIndex].textAlign = 'center';
			this.cxs[canvasIndex].fillStyle = 'white';
			this.cxs[canvasIndex].font = 'normal 700 16px arial';

			this.cxs[canvasIndex].fillText(text, parseFloat(x) + 110, parseFloat(y) + 25);
		} else {
			this.cxs[canvasIndex].drawImage(img, parseFloat(x) - 30, parseFloat(y), 170, 41);
			this.cxs[canvasIndex].font = 'normal 700 16px arial';
			this.cxs[canvasIndex].textAlign = 'center';
			this.cxs[canvasIndex].fillStyle = 'white';
			this.cxs[canvasIndex].fillText(text, parseFloat(x) + 65, parseFloat(y) + 25);
		}

	}

	setCanvasRenderingContext2D(canvasEl, canvasIndex) {
		if (!this.cxs[canvasIndex]) {
			this.cxs[canvasIndex] = canvasEl.getContext('2d');
		}
	}

	back() {
		if (this.popupApprovalId != null) {
			this.modalTabChange.emit({ id: this.approval.id, TabId: 'approvalInfo' });
		}
		// this.router.navigate(['/prepare/edit-approval/' + this.approvalId],{ queryParams: {activeTab: this.activeTab} });
	}

	scroleTo(index: number) {
		if (index + 1 != this.currentSlide) {
			const canvas = $('.canvas_' + index).first();
			if (canvas.length > 0) {
				const top = canvas.offset().top;
				window.scroll({ top: top - 150, behavior: 'smooth' });
				this.currentSlide = index + 1;
			}
		}
	}

	hasError(textForm: NgForm, field: string, validation: string) {
		if (textForm && Object.keys(textForm.form.controls).length > 0 && textForm.form.controls[field] &&
			textForm.form.controls[field].errors && validation in textForm.form.controls[field].errors) {
			if (validation) {
				return (textForm.form.controls[field].dirty &&
					textForm.form.controls[field].errors[validation]) || (this.edit && textForm.form.controls[field].errors[validation]);
			}
			return (textForm.form.controls[field].dirty &&
				textForm.form.controls[field].invalid) || (this.edit && textForm.form.controls[field].invalid);
		}
	}

	/* Start Swipe Event */
	onSwipe(evt) {
		const x =
			Math.abs(evt.deltaX) > 40
				? evt.deltaX > 0
					? 'right'
					: 'left'
				: '';
		const y =
			Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? 'down' : 'up') : '';
		if (evt.deltaX > 0) {
			if (this.currentSlide !== 1) {
				this.prevSlide();
			}
		} else if (Math.abs(evt.deltaX) > 40) {
			if (this.currentSlide !== this.documentSlides.length) {
				this.nextSlide();
			}
		}
	}

	nextSlide() {
		this.scaleToFit(this.documentSlides[this.currentSlide], this.currentSlide);
	}

	prevSlide() {
		this.scaleToFit(this.documentSlides[this.currentSlide - 2], this.currentSlide - 2);
	}

	drawPointsIntoCanvas(canvasEl) {
		this.signaturesMap.forEach((point) => {
			this.drawSignatureImage(canvasEl, this.isArabic ? point.name_ar : point.name, point.x, point.y, point.slide);
		});
	}

	fireClickEventForCanvas(canvasEl, index) {
		this.clickSubscription = fromEvent(canvasEl, 'click').subscribe((e: MouseEvent) => {
			const rect = canvasEl.getBoundingClientRect();
			const scaleX = canvasEl.width / rect.width;
			const scaleY = canvasEl.height / rect.height;
			const cursorBounds = this.cursorSign.getBoundingClientRect();
			this.textPositionX = e.clientX - (cursorBounds.left) > 7
				? ((e.clientX - rect.left - (this.assignedMemberName.length > 13 ? 170 : 85)) * scaleX)
				: ((e.clientX - rect.left) * scaleX);
			this.textPositionY = e.clientY - (cursorBounds.top) > 7
				? ((e.clientY - rect.top - 30) * scaleY)
				: ((e.clientY - rect.top) * scaleY);
			this.currentSlide = index + 1;
			if (this.isAddText) {
				this.drawSignatureImage(canvasEl, this.assignedMemberName, this.textPositionX, this.textPositionY, this.currentSlide - 1);

				this.isAddText = false;
				this.showCursor = false;
			}
		});
	}

	fireMouseDownEventForCanvas(canvasEl, index) {
		this.clickSubscription = fromEvent(canvasEl, 'mousedown').subscribe((e: MouseEvent) => {
			const rect = canvasEl.getBoundingClientRect();
			const scaleX = canvasEl.width / rect.width;
			const scaleY = canvasEl.height / rect.height;
			this.textPositionX = ((e.clientX - rect.left) * scaleX) + 40;
			this.textPositionY = (e.clientY - rect.top) * scaleY;
			this.currentSlide = index + 1;
			if (!this.isAddText) {
				this.signaturesMap.forEach((point) => {
					const biggerThanXmin = this.textPositionX >= (parseFloat(point.x) - 30);
					const smallerThanXmax = this.textPositionX <= (parseFloat(point.x) + 100);
					const biggerThanYmin = this.textPositionY >= parseFloat(point.y);
					const smallerThanYmax = this.textPositionY <= (parseFloat(point.y) + 50);
					if ((biggerThanXmin && smallerThanXmax) && (biggerThanYmin && smallerThanYmax)) {
						this.addField(point);
					}
				});
			}
		});
	}

}
