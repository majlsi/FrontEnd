import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureService } from '../../../../core/services/decision/signature.service';
import { VerificationMethodModalComponent } from '../verification-method-modal/verification-method-modal.component';
@Component({
  selector: 'm-comment-modal',
  templateUrl: './comment-modal.component.html'
})
export class CommentModalComponent implements OnInit {
	submitted: boolean = false;
	rejectComment: string;
	rejectObject: Object;
	@Input() documentFieldId: number;
	@Input() lang: string;
	@Input() decisionId: number;
	constructor(private modalService: NgbModal, public activeModal: NgbActiveModal) {

      }

	ngOnInit() {
	}
	save() {

		const ModelRef = this.modalService.open(VerificationMethodModalComponent, {
			centered: true,
			size: "lg",
			backdrop: "static",
			keyboard:false
		});
		ModelRef.componentInstance.lang = this.lang;
		ModelRef.componentInstance.decisionId = this.decisionId;
		ModelRef.result.then((result) => {
			if (result === true) {
				this.activeModal.close(this.rejectComment);
				this.submitted = true;
				if (this.rejectComment != undefined) {
					this.rejectObject = { DocumentFieldComment: this.rejectComment };
				} else {
					this.rejectObject = { DocumentFieldComment: null };
				}
			}
		});

	}
}
