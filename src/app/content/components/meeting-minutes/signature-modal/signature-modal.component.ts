import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturePad } from 'angular2-signaturepad';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { SignatureService } from '../../../../core/services/decision/signature.service';
import { VerificationMethodModalComponent } from '../verification-method-modal/verification-method-modal.component';
import { SignatureTypes } from '../../../../core/models/enums/signature-types';
import { UserSignature } from '../../../../core/models/user-signature';
import { SignaturFontsConfig } from '../../../../config/signature-fonts';
import { ActivatedRoute } from '@angular/router';
import { DocumentPage } from '../../../../core/models/document-page';

@Component({
	selector: 'm-signature-modal',
	templateUrl: './signature-modal.component.html'
})
export class SignatureModalComponent implements OnInit {
	@ViewChild('myCanvas') myCanvas: ElementRef;
	dataURL: string;
	submitted: boolean = false;
	drawStarted: boolean = false;
	signComment: string;
	imageChangedEvent: any;
	fileName: any;
	imageSelected: boolean = false;
	signObject: Object;
	hasEmptySign: boolean;
	hasEmptyUpload: boolean = false;
	hasEmptyType: boolean = false;
	hasEmptyChoice: boolean = false;
	haveSignature = true;
	activeTab: number;
	signatureTypeEnum = SignatureTypes;
	userSignatures: Array<UserSignature> = [];
	@ViewChild(SignaturePad) signaturePad: SignaturePad;

	@Input() documentFieldId: number;
	@Input() decisionId: number;
	@Input() lang: string;
	localUrl: any[];
	sigantureDataUrl: string;
	resizedDataUrl: any;
	selectedItemId: number;
	saveUserSignature: boolean = false;
	fontNames: Array<string> = new SignaturFontsConfig().config;
	signatureByType: string = '';
	i = 0;
	ctx: CanvasRenderingContext2D;
	signatureUploadTypeError: boolean = false;

	documentPages: Array<DocumentPage> = [];


	constructor( private modalService: NgbModal,
		private _crudService: CrudService,
		private _signatureService: SignatureService,
		private route: ActivatedRoute,
		public activeModal: NgbActiveModal) {
		this.activeTab = this.signatureTypeEnum.DRAW;
	}

	private signaturePadOptions: Object = {
		'minWidth': 3,
		'canvasWidth': 750,
		'canvasHeight': 150
	};


	ngOnInit() {
		this.getUserSavedSignatures();
	}


	async save() {
		this.submitted = true;
		if (+this.activeTab === this.signatureTypeEnum.DRAW) {
			this.dataURL = this.signaturePad.toDataURL('image/png');
			this.resizedDataUrl = await this.resizedataURL(this.dataURL, 140, 56);
		} else if (+this.activeTab === this.signatureTypeEnum.UPLOAD) {
			this.resizedDataUrl = await this.localUrl;
		} else if (+this.activeTab === this.signatureTypeEnum.TYPE) {
			const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
			this.dataURL = canvasEl.toDataURL();
			this.resizedDataUrl = await this.resizedataURL(this.dataURL, 140, 56);
		} else if (+this.activeTab === this.signatureTypeEnum.SAVEDSIGNATURE) {
			this.resizedDataUrl = this.sigantureDataUrl;
		}

		if (this.signComment != undefined) {
			this.signObject = { DocumentFieldValue: this.resizedDataUrl, DocumentFieldComment: this.signComment, SignatureTypeID: this.activeTab };
		} else {
			this.signObject = { DocumentFieldValue: this.resizedDataUrl, DocumentFieldComment: null, SignatureTypeID: this.activeTab };
		}

		this.activeModal.close({ signObj: this.signObject, saveSignature: this.saveUserSignature });
	}

	clear() {
		this.hasEmptySign = false;
		this.drawStarted = false;
		this.signaturePad.clear();
	}

	changeFont() {
		this.i++;
		if (this.i === this.fontNames.length) {
			this.i = 0;
		}

		this.startTyping();
	}

	startTyping() {
		const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
		this.ctx = canvasEl.getContext('2d');
		this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		canvasEl.width = 750;
		canvasEl.height = 180;
		this.ctx.lineCap = 'round';
		this.ctx.strokeStyle = '#000';
		this.ctx.font = '50px ' + this.fontNames[this.i];
		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillStyle = 'black';
		this.ctx.fillText(this.signatureByType, canvasEl.width, 80);
	}

	drawStart() {
		this.drawStarted = true;
	}


	resizedataURL(datas, wantedWidth, wantedHeight) {
		return new Promise(async function (resolve, reject) {
			var img = document.createElement('img');
			img.src = datas;
			img.onload = function () {
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.width = wantedWidth;
				canvas.height = wantedHeight;
				ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);
				var dataURI = canvas.toDataURL();
				resolve(dataURI);
			};
			img.src = datas;

		});
	}
	async submit(saveSignature: boolean) {

		this.hasEmptySign = false;
		this.hasEmptyUpload = false;
		this.hasEmptyType = false;
		this.hasEmptyChoice = false;
		this.signatureUploadTypeError = false;

		if (+this.activeTab === this.signatureTypeEnum.DRAW) {
			if (!this.drawStarted) {
				this.hasEmptySign = true;
				this.submitted = false;
			} else {
				this.openVerificationModal(saveSignature);
			}
		} else if (+this.activeTab === this.signatureTypeEnum.UPLOAD) {
			if (!await this.localUrl) {
				this.hasEmptyUpload = true;
				this.submitted = false;
			} else {
				this.openVerificationModal(saveSignature);
			}
		} else if (+this.activeTab === this.signatureTypeEnum.TYPE) {
			if (!this.signatureByType) {
				this.hasEmptyType = true;
				this.submitted = false;
			} else {
				this.openVerificationModal(saveSignature);
			}
		} else if (+this.activeTab === this.signatureTypeEnum.SAVEDSIGNATURE) {
			if (!this.sigantureDataUrl) {
				this.hasEmptyChoice = true;
				this.submitted = false;
			} else {
				this.openVerificationModal(saveSignature);
			}
		}
	}

	openVerificationModal(saveSignature) {
		this.saveUserSignature = saveSignature;
		const ModelRef = this.modalService.open(VerificationMethodModalComponent, {
			centered: true,
			// size: "sm",
			backdrop: "static",
			keyboard:false
		});
		ModelRef.componentInstance.lang = this.lang;
		ModelRef.componentInstance.decisionId = this.decisionId;
		ModelRef.result.then((result) => {
			if (result === true) {
				this.save();
			}
		});
	}
	showPreviewImage(event: any) {
		this.signatureUploadTypeError = false;
		this.hasEmptyUpload = false;
		if (event.target.files && event.target.files[0]) {
			const file: File = event.target.files[0];
			const pattern = /image-*/;
			if (!file.type.match(pattern)) {
				this.signatureUploadTypeError = true;
				return;
			}
			let reader = new FileReader();
			reader.onload = (event: any) => {
				this.localUrl = event.target.result;
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	}

	clearImage() {
		this.localUrl = null;
	}

	setSignatureValueUrl(srcData, id) {
		this.sigantureDataUrl = srcData;
		this.selectedItemId = id;
	}


	changeTab(event) {
		this.activeTab = event.nextId;
	}

	getUserSavedSignatures() {
		this._signatureService.getUserSignatures(this.decisionId).subscribe(res => {
			this.userSignatures = res;
		},
			error => {

			});
	}

}
