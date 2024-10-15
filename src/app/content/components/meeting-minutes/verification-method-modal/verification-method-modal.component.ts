import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VerificationModalComponent } from '../verification-modal/verification-modal.component';
import { VerificationCodeType } from '../../../../core/models/verificationCodeType';
import { MatRadioChange } from '@angular/material/radio';
import { VerificationCodeService } from '../../../../core/services/decision/verification-code.service';

@Component({
	selector: 'm-verification-method-modal',
	templateUrl: './verification-method-modal.component.html'
})
export class VerificationMethodModalComponent implements OnInit {

	radioButtonValue = 1;
	@Input() lang: string;
	@Input() decisionId: number;
	constructor(private modalService: NgbModal,
		public activeModal: NgbActiveModal,
		private verificationCodeService: VerificationCodeService) { }

	ngOnInit() { }
	close() {
		this.activeModal.close('Go to SignatureModal');
	}

	radioChange(event: MatRadioChange) {
		this.radioButtonValue = event.value;
	}

	openVerificationCode() {
		var verificationCodeType = new VerificationCodeType();
		// if value == 2 or 3
		verificationCodeType.SendEmail = (this.radioButtonValue & 2) != 0;
		// if value == 1 or 3
		verificationCodeType.SendSms = (this.radioButtonValue & 1) != 0;
		this.verificationCodeService.generateCode(verificationCodeType, this.lang, this.decisionId);
		const ModelRef = this.modalService.open(VerificationModalComponent, {
			centered: true,
			// size: 'lg'
		});

		ModelRef.componentInstance.useEmail = verificationCodeType.SendEmail;
		ModelRef.componentInstance.useSms = verificationCodeType.SendSms;
		ModelRef.componentInstance.lang = this.lang;
		ModelRef.componentInstance.decisionId = this.decisionId;
		ModelRef.componentInstance.verificationCodeType = verificationCodeType;
		ModelRef.result.then((result) => {
			this.activeModal.close(result);
		});
	}
}
