import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ElementRef, AfterViewInit, HostListener, TemplateRef, ViewChildren, QueryList } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin, fromEvent, Subscription, merge, Observable, } from "rxjs";
import { AuthNoticeService } from "../../../../core/auth/auth-notice.service";
import { NgForm } from "@angular/forms";

import { TranslationService } from "../../../../core/services/translation.service";
import { MeetingService } from "../../../../core/services/meeting/meeting.service";
import { CrudService } from "../../../../core/services/shared/crud.service";

import { environment } from "../../../../../environments/environment";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

import { UploadService } from "../../../../core/services/shared/upload.service";
import { Document } from '../../../../core/models/document';
import { DocumentService } from "../../../../core/services/document/document.service";
import { DocumentAnnotation } from "../../../../core/models/document-annotation";
import * as $ from 'jquery';
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { DocumentStatuses } from "../../../../core/models/enums/document-statuses";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
import { UserService } from "../../../../core/services/security/users.service";
import { User } from "../../../../core/models/user";
import { NotificationService } from "../../../../core/services/notification/notification.service";
import { NotificationModelTypes } from "../../../../core/models/enums/notification-model-types";

@Component({
	selector: "m-review-file",
	templateUrl: "./review-file.component.html",
	styleUrls: ["./presentation.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ReviewFileComponent implements AfterViewInit, OnInit {
	
	showRevisionsMenu: boolean = false;
	activeTab: string;
	documentAnnotations: Array<DocumentAnnotation> = [];
	@ViewChildren('myCanvas', { read: ElementRef }) canvases: QueryList<ElementRef>;
	@ViewChild("content") modalContent: TemplateRef<any>;

	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;
	closeResult: string;
	isArabic: boolean;
	documentId: number;
	documentObs: Observable<Document>;
	document: Document = new Document();
	documentSlides: any;
	imagesBaseURL = environment.imagesBaseURL;
	cxs: Array<CanvasRenderingContext2D> = [];
	currentSlide: number = 1;
	textNotes: string = "";
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
	annotationsList: Array<any> = [];
	documenSlidesObs: Observable<any>;

	loaded: boolean = false;
	documentStatusEnm = DocumentStatuses;
	colors: Array<string> = ['#FFF15B', '#90F2F1', '#FFB3CF', '#BEF6D0' ,' #D3A7FE'];
	userObs: Observable<any>;
	user: User = new User();
	selectedAnnotation: number;
	documentAnnotationsObs: Observable<any>;

	constructor(
		public authNoticeService: AuthNoticeService,
		private route: ActivatedRoute,
		private _translationService: TranslationService,
		private _meetingService: MeetingService,
		private modalService: NgbModal,
		private router: Router,
		private _userService: UserService,
		private translate: TranslateService,
		private _documentService: DocumentService,
		private _crudService: CrudService,
		private layoutUtilsService: LayoutUtilsService,
		private _uploadService: UploadService,
		private datePipe: DatePipe,
		private notificationService: NotificationService
	) {}

	ngOnInit(): void {
		this.listenToSystemNotificationChanged();
		this.listenToChangeDocumentChannel();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.documentId = +params['id']; // (+) converts string 'id' to a number
				this.getDocument();
				this.getCurrentUser();
				forkJoin([this.documentObs,this.userObs])
				.subscribe(data => {
					this.document = data[0];
					this.user = data[1].user;
					this.getDocumentannotationsObs();
					this.loadDocument();
				});
			}
		});
		this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeTab = queryParams.activeTab;
			}
		});
	}

	ngAfterViewInit() {
		this.canvases.forEach((canvas,index) => {
			const canvasEl: HTMLCanvasElement = canvas.nativeElement;
			this.cxs[index] = canvasEl.getContext("2d");
			canvasEl.style.display = "block";
			canvasEl.style.margin = "0 auto";
			this.setCanvasRenderingContext2D(canvasEl,index);
			this.cxs[index].lineWidth = 3;
			this.cxs[index].lineCap = "round";
			this.cxs[index].strokeStyle = "#000";
		});
	}

	getCurrentUser() {
        this.userObs = this._userService.getCurrentUser();
    }

	getDocument(){
		this.documentObs = this._crudService.get<Document>('admin/documents',this.documentId);
	}

	getDocumentannotations (modifyPosition: boolean = true, drawAnnotations: boolean = false){
		this._crudService.getList<DocumentAnnotation>('admin/documents/' + this.documentId + '/annotations').subscribe(res => {
			this.documentAnnotations = res;
			if (modifyPosition){
				this.documentAnnotations.forEach((annotation, key) => {
					this.documentAnnotations[key] = this.calculateAnnotationPositions(annotation);
				});
			}
			this.setIcons();
			if(drawAnnotations){
				this.drawAnnotationIntoCanvas(this.documentAnnotations);
			}
		});
	}

	setIcons() {
		let usersIds = [];
		this.documentAnnotations.forEach((annotation, index) => {
			if (annotation.user_id == this.user.id) {
				this.documentAnnotations[index].color_code = this.colors[0];
				this.documentAnnotations[index].image_url = 'assets/app/media/img/icons/notes-0.png';
			} else {
				let key = usersIds.indexOf(annotation.user_id) ;
				let colorIndex;
				if (key > -1) {
					colorIndex = key >= this.colors.length? this.colors.length - 1 : key + 1;
				} else {
					colorIndex = usersIds.length >= this.colors.length? this.colors.length - 1 : usersIds.length + 1;
					usersIds.push(annotation.user_id);
				}
				this.documentAnnotations[index].color_code = this.colors[colorIndex];
				this.documentAnnotations[index].image_url = 'assets/app/media/img/icons/notes-' + colorIndex +'.png';
			}
		});
	}

	toggle() {
		this.show = !this.show;
	}

	addText() {
		this.layoutUtilsService.showActionNotification(this.translate.instant('REVIEWS_ROOM.REVIEW.ADD_COMMENT_NOTE'), MessageType.Read);
		this.isAddText = true;	
		this.textNotes = null;
	}

	getDocumentSlides() {
		this.documenSlidesObs = this._documentService.getDocumentSlides(this.documentId);
	}

	loadDocument(newDocumentId = null) {
		this.canvases.forEach(canvas => {
			const canvasEl: HTMLCanvasElement = canvas.nativeElement;
			this.mouseDown = merge(
				fromEvent(canvasEl, "mousedown"),
				fromEvent(canvasEl, "touchstart")
			);
	
			this.mouseUp = merge(
				fromEvent(canvasEl, "mouseup"),
				fromEvent(canvasEl, "touchend")
			);
			this.mouseMove = merge(
				fromEvent(canvasEl, "mousemove"),
				fromEvent(canvasEl, "touchmove")
			);
			this.mouseleave = merge(
				fromEvent(canvasEl, "mouseleave"),
				fromEvent(canvasEl, "touchend")
			);
		});

		this.getLanguage();
		this.getDocumentSlides();
		forkJoin([this.documenSlidesObs,this.documentAnnotationsObs]).subscribe(
			(data) => {
				this.documentSlides = data[0].document_images_with_size;
				this.documentAnnotations = data[1];
				this.setIcons();
				this.documentAnnotations.forEach((annotation, key) => {
					this.documentAnnotations[key] = this.calculateAnnotationPositions(annotation);
				});
				if (newDocumentId != null) {
					this.ngAfterViewInit();
				}
				this.isLoaded = true;
			},
			(error) => {}
		);
	}

	loadData(index) {
		const documentAnnotations = this.getSlideAnnotaions(index);
		const canvasEl = this.canvases.find((canvas,key) => key == index).nativeElement;
		this.fireClickEventForCanvas(canvasEl,index);
		this.drawAnnotationIntoCanvas(documentAnnotations);
	}

	private getSlideAnnotaions(pageNumber) {
		return this.documentAnnotations.filter(
			(documentAnnotation) =>
				documentAnnotation.page_number === pageNumber + 1
		);
	}

	open(content) {
		this.modalService.open(content, { size: "xl" as "lg" }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return "by pressing ESC";
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return "by clicking on a backdrop";
		} else {
			return `with: ${reason}`;
		}
	}

	completeReview() {
		const _title: string = this.translate.instant('REVIEWS_ROOM.COMPLETE.TITLE');
		const _description: string = this.translate.instant('REVIEWS_ROOM.COMPLETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('REVIEWS_ROOM.COMPLETE.WAIT_DESCRIPTION');
		const _message = this.translate.instant('REVIEWS_ROOM.COMPLETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.ENDTASK'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._documentService.changeStatusOfDocument(this.documentId).subscribe(res => {
				this.document.document_status_id = DocumentStatuses.complete;
				this.layoutUtilsService.showActionNotification(_message, MessageType.Read);
				this.back();
			}, error => {
				this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Read);
			});
		});
	}

	close() {
		this.submitted = false;
		this.edit = false;
		this.textNotes = '';
	}

	scaleToFit(slide,index) {
		const image = new Image();
		image.src = this.imagesBaseURL + slide.url;

		image.addEventListener('load',(e) => {
			const indexNum = this.documentSlides.findIndex((element) => {
				return element === slide.url;
			});
			const canvasEl: HTMLCanvasElement = this.canvases.find((canvas, key) => index == key).nativeElement;
	
			this.imgWidth = slide.width;
			this.imgHeight = slide.height;
	
			//this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			canvasEl.style.background = "url(" + this.imagesBaseURL + slide.url + ")";
			canvasEl.style.backgroundSize = "contain";
			canvasEl.style.backgroundRepeat = "no-repeat";
			canvasEl.style.backgroundPosition = "center";
	
			if (this.imgWidth <= window.innerWidth) {
				canvasEl.width = this.imgWidth * 0.8;
			} else {
				canvasEl.width = window.innerWidth * 0.8;
			}
	
			canvasEl.height = (this.imgHeight * canvasEl.width) / this.imgWidth;
			this.loadData(index);
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	drawTextonCanvas(text, textPositionX, textPositionY, canvasIndex, img) {
		const canvasEl: HTMLCanvasElement = this.canvases.find((canvas, key) => canvasIndex == key).nativeElement;
		const rect = canvasEl.getBoundingClientRect();
		const x = textPositionX;
		const y = textPositionY;
		this.setCanvasRenderingContext2D(canvasEl,canvasIndex);
		this.cxs[canvasIndex].beginPath();
		const fontSize = 18  + 'px';
		this.cxs[canvasIndex].font = 'italic ' + fontSize + ' Arial';
		this.cxs[canvasIndex].textAlign = 'center';
		this.cxs[canvasIndex].textBaseline = 'middle';
		this.cxs[canvasIndex].fillStyle = 'red';
		this.cxs[canvasIndex].rect(0, 0, canvasEl.width, canvasEl.height);
		this.cxs[canvasIndex].drawImage(img, x, y, 25, 25);
	}

	setCanvasRenderingContext2D(canvasEl,canvasIndex){
		if (!this.cxs[canvasIndex]) {
			this.cxs[canvasIndex] = canvasEl.getContext("2d");
		}
	}

	saveAnnotaion(textForm) {
		this.submitted = true;
		this.edit = true;

		if (textForm.valid) {
			let annotation = new DocumentAnnotation();
			let canvasWidth;
			let slide = this.documentSlides[this.currentSlide - 1];
			annotation.page_number = this.currentSlide;
			annotation.annotation_text = this.textNotes;
			if (slide.width <= window.innerWidth) {
				annotation.x_upper_left = this.textPositionX / 0.8;
				canvasWidth = slide.width * 0.8;
			} else {
				annotation.x_upper_left = (this.textPositionX * slide.width)/ (window.innerWidth * 0.8);
				canvasWidth = window.innerWidth * 0.8;
			}
			annotation.y_upper_left = (this.textPositionY * slide.width) / canvasWidth;
			annotation.color_code = this.colors[0];
			annotation.image_url = 'assets/app/media/img/icons/notes-0.png';

			this._crudService.add<any>('admin/documents/' + this.documentId + '/annotations',annotation).subscribe(res => {
				this.submitted = false;
				this.getDocumentannotations();
				let img = new Image();
				img.src = annotation.image_url;
				img.addEventListener('load',(e) => {
					this.drawTextonCanvas(annotation.annotation_text, this.textPositionX, this.textPositionY, this.currentSlide - 1,img);
					this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
					this.close();
				});
			}, error => {
				this.submitted = false;
				this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Read);
			});
		} else {
			this.submitted = false;
		}
	}

	download(documentData: Document, type: string){
		var show_notes = type == 'original'? false : true;
		if(show_notes){
			this._documentService.downloadDocument(documentData.id).subscribe(res => {
				this.downloadFile(res,documentData,type);
			});
		} else {
			this._uploadService.downloadFile(environment.imagesBaseURL +  documentData.document_url).subscribe((res) => {
				this.downloadFile(res,documentData,type);
			});
		}
	}

	downloadFile(res,documentData,type){
		const downloadURL = window.URL.createObjectURL(res);
		const link = document.createElement("a");
		link.href = downloadURL;
		link.download = (type == 'original') ? documentData.document_name : ('reviwed_' + documentData.document_name.split('.').pop() + '.pdf');
		link.click();
	}

	back() {
		this.router.navigate(['/reviews-room'],{ queryParams: {activeTab: this.activeTab} });
	}

	scroleTo(index: number){
		if (index +1 != this.currentSlide) {
			const canvas = $('.canvas_' + index).first();
            if(canvas.length > 0) {
                const top = canvas.offset().top;
				window.scroll({top: top - 150, behavior: 'smooth'});
				this.currentSlide = index +1;
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

	fireClickEventForCanvas(canvasEl,index) {
		this.clickSubscription = fromEvent(canvasEl, "click").subscribe((e: MouseEvent) => {
			const rect = canvasEl.getBoundingClientRect();
			this.textPositionX = e.clientX - rect.left;
			this.textPositionY = e.clientY - rect.top;
			this.currentSlide = index + 1;
			if (this.isAddText) {
				this.closeAllAnnotations();
				this.open(this.modalContent);
				this.isAddText = false;
			} else {
				const slideAnnotaions = this.getSlideAnnotaions(index);
				const clossedAnnotation = slideAnnotaions.find(annotaion => this.textPositionX >= +annotaion.x_upper_left && this.textPositionX <= (+annotaion.x_upper_left + 25) &&
						this.textPositionY >= +annotaion.y_upper_left && this.textPositionY <= (+annotaion.y_upper_left + 25));
				if(clossedAnnotation) {
					let annotationIndex = this.documentAnnotations.findIndex(annotation => annotation.id == clossedAnnotation.id);
					this.openAnnotationData(clossedAnnotation,index,annotationIndex);
				}
			}
		});
	}

	closeAllAnnotations() {
		this.selectedAnnotation = null;
		let annotationsPopup = document.getElementsByClassName('annotaion_popup');
		Array.from(annotationsPopup).forEach((el) => {
			el.remove();
		});
	}

	openAnnotationData(slideAnnotation: DocumentAnnotation,index,annotationIndex) {
		this.closeAllAnnotations();
		this.selectedAnnotation = annotationIndex;
		let canvasParrent = document.getElementById('canvas_parrent_' + index);
		let annotationPopup = document.createElement('div');
		annotationPopup.setAttribute('id', 'annotaion_' + slideAnnotation.id);
		annotationPopup.setAttribute('class', 'annotaion_popup p-3');
		let dataContainer = document.createElement('div');
		dataContainer.setAttribute('class', 'd-flex justify-content-between');
		let child1 = document.createElement('div');
		let span2 = document.createElement('span');
		span2.setAttribute('class', 'font-weight-600');
		span2.innerHTML = this.isArabic? slideAnnotation.name_ar : (slideAnnotation.name? slideAnnotation.name : slideAnnotation.name_ar);
		child1.appendChild(span2);
		let child2 = document.createElement('div');
		child1.setAttribute('class', 'd-flex justify-content-between');
		child2.setAttribute('class', 'd-flex justify-content-between');
		let small =  document.createElement('small');
		small.innerHTML = this.datePipe.transform(slideAnnotation.creation_date, "d MMMM y, hh:mm a");
		child2.appendChild(small);

		annotationPopup.style.cssText = 'width: 200px;background: white;box-shadow: 0 2px 15px rgba(0, 0, 0, 0.16);border-radius: 4px;position: absolute;top: ' + (+slideAnnotation.y_upper_left + 25 + canvasParrent.offsetTop) + 'px;left: ' + (  +slideAnnotation.x_upper_left+ 25) + 'px;';
		annotationPopup.appendChild(child1);
		annotationPopup.appendChild(child2);
		if (slideAnnotation.can_edit && (this.document.document_status_id == DocumentStatuses.new || this.document.document_status_id == DocumentStatuses.inProgress)) {
			let child3 = document.createElement('div');
			child3 = document.createElement('div');
			child3.setAttribute('id','input-div');
			let input = document.createElement('input');
			input.setAttribute('type', 'text');
			input.setAttribute('id', 'annotation_text_' + slideAnnotation.id);
			input.setAttribute('name', 'annotation_text');
			input.setAttribute('value', slideAnnotation.annotation_text);
			input.setAttribute('class','form-control');
			input.addEventListener('change', (e) => {
				let errorEl = document.getElementById('annotation-error');
				if (errorEl) {
					errorEl.remove();
				}
				let inptEl = e.target as HTMLTextAreaElement;
				this.textNotes = inptEl.value;
			});
			child3.appendChild(input);
		    const button = document.createElement('button');
			button.setAttribute('id', 'annotaion-button _' + slideAnnotation.id);
			button.setAttribute('class', 'btn btn-primary btn-sm mt-2');
		    button.addEventListener('click', (e) => {
				let buttonEl = e.target as HTMLTextAreaElement;
				let annotaionId =  +buttonEl.id.split('_')[1];
				let annotation = this.documentAnnotations.find(item => item.id == annotaionId);
				let inputEl = document.getElementById('annotation_text_' + annotation.id);
				if(this.textNotes && this.textNotes.length > 0){
					annotation.annotation_text = this.textNotes;
					this.updateDocumentAnnotation(annotation);
				} else if(!document.getElementById('annotation-error')){
					let error = document.createElement('div');
					error.setAttribute('class','error text-danger form-control-feedback');
					error.setAttribute('id','annotation-error');
					error.innerHTML = this.translate.instant('REVIEWS_ROOM.VALIDATION.PRESENTATION_NOTES');
					let inputDiv = document.getElementById('input-div');
					inputDiv.appendChild(error);
				}
			});
			button.innerText = this.translate.instant('BUTTON.SAVE');
			annotationPopup.appendChild(child3);
			annotationPopup.appendChild(button);
			this.textNotes = slideAnnotation.annotation_text;
		} else {
			let child3 = document.createElement('p');
			child3.innerHTML = slideAnnotation.annotation_text;
			annotationPopup.appendChild(child3);
		}
		canvasParrent.appendChild(annotationPopup);	
		this.scroleToAnnotation(slideAnnotation,index);
	}

	scroleToAnnotation(slideAnnotation,index) {
		const annotationPopup = $('#annotaion_' + slideAnnotation.id).first();
        if(annotationPopup.length > 0) {
            const top = annotationPopup.offset().top;
			window.scroll({top: top - 200, behavior: 'smooth'});
			this.currentSlide = index +1 != this.currentSlide ? index +1 : this.currentSlide;
        }
	}

	updateDocumentAnnotation(annotation){
		delete annotation.x_upper_left;
		delete annotation.y_upper_left;

		this._crudService.edit<any>('admin/documents/' + this.documentId+ '/annotations',annotation,annotation.id).subscribe(res => {
			let annotationDiv = document.getElementById('annotaion_' + annotation.id);
			if(annotationDiv){
				annotationDiv.remove();
			}
			this.textNotes = null;
			this.getDocumentannotations();
			this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Read);
		}, error => {
			this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Read);
		})
	}

	/* Start Swipe Event */
	onSwipe(evt) {
		const x =
			Math.abs(evt.deltaX) > 40
				? evt.deltaX > 0
					? "right"
					: "left"
				: "";
		const y =
			Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? "down" : "up") : "";
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
		this.scaleToFit(this.documentSlides[this.currentSlide],this.currentSlide);
	}

	prevSlide() {
		this.scaleToFit(this.documentSlides[this.currentSlide - 2],this.currentSlide -2);
	}

	deleteAnnotation(annotation: DocumentAnnotation) {
		this.closeAllAnnotations();
		const _title: string = this.translate.instant('REVIEWS_ROOM.DELETE_ANNOTATION.TITLE');
		const _description: string = this.translate.instant('REVIEWS_ROOM.DELETE_ANNOTATION.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('REVIEWS_ROOM.DELETE_ANNOTATION.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('REVIEWS_ROOM.DELETE_ANNOTATION.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Document>('admin/documents/' + this.documentId + '/annotations', annotation.id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.getDocumentannotations();
					this.cxs[annotation.page_number -1].clearRect(annotation.x_upper_left, annotation.y_upper_left, 25, 25);
				},
				error => {
					this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Delete);
				});
		});
	}

	calculateAnnotationPositions(documentAnnotation){
		let canvasWidth;
		const slide = this.documentSlides[documentAnnotation.page_number - 1];
		if (slide.width <= window.innerWidth) {
			documentAnnotation.x_upper_left = documentAnnotation.x_upper_left * 0.8;
			canvasWidth = slide.width * 0.8;
		} else {
			documentAnnotation.x_upper_left = documentAnnotation.x_upper_left * (window.innerWidth * 0.8) / slide.width;
			canvasWidth = window.innerWidth * 0.8;
		}
		documentAnnotation.y_upper_left = (documentAnnotation.y_upper_left * canvasWidth) /  slide.width;
		
		return documentAnnotation;
	}

	listenToSystemNotificationChanged() {
		this.notificationService.notificationData.subscribe(res => {
			if (res.notificationModelId == this.documentId && res.notificationModelType == NotificationModelTypes.reviewDocument) {
				if(res.notificationExtraData.deleted_annotation_id){
					let index = this.documentAnnotations.findIndex(annotation => annotation.id == res.notificationExtraData.deleted_annotation_id);
					if (index > -1) {
						let annotation = this.documentAnnotations[index];
						this.cxs[annotation.page_number -1].clearRect(annotation.x_upper_left, annotation.y_upper_left, 25, 25);
						// remove annotation pop up
						let annotationPopup = document.getElementById('annotaion_' + annotation.id);
						if(annotationPopup){
							annotationPopup.remove();
						}
					}
				}
				this.getDocumentAllData();
			}
		});
	}

	listenToChangeDocumentChannel() {
		window.Echo.channel('changeDocumentFile')
			.listen('.ChangeDocumentFileEvent', (data) => {
				const documentId = +data.data.notificationUrl;
				const reviewersIds = data.data.notificationUsersIds;
				const index = reviewersIds.findIndex(reviewerId => reviewerId == this.user.id);
				if (index > -1) {
					this._documentService.getDocumentSlides(this.documentId).subscribe(res => {
						this.documentSlides = res.document_images_with_size;
					});
				}
				if (documentId == this.documentId) {
					this.getDocumentAllData();
				}
			}, (e) => {
			});
	}

	getDocumentAllData() {
		this.getDocumentannotations(true, true);
		this._crudService.get<Document>('admin/documents',this.documentId).subscribe(res => {
			this.document = res;
		});
	}

	drawAnnotationIntoCanvas(documentAnnotations) {
		documentAnnotations.forEach((documentAnnotation) => {
			let img = new Image();
			img.src = documentAnnotation.image_url;
			img.addEventListener('load',(e) => {
				this.drawTextonCanvas(documentAnnotation.annotation_text, documentAnnotation.x_upper_left,
					documentAnnotation.y_upper_left,documentAnnotation.page_number -1,img);
			})
		});
	}

	getDocumentannotationsObs(){
		this.documentAnnotationsObs = this._crudService.getList<DocumentAnnotation>('admin/documents/' + this.documentId + '/annotations');
	}
}
