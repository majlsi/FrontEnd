import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../../../core/models/user';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'm-edit-member-modal',
  templateUrl: './edit-member-modal.component.html',
  styleUrls: ['./edit-member-modal.component.scss']
})
export class EditMemberModalComponent implements OnInit {

    startDateModel: any;
    expiredDateModel: any;
    isDateError: boolean = false;
    submitted: boolean = false;
    edit: boolean = false;
    closeResult: string;
    modalReference: NgbModalRef;
    @Input() user: User;
    @Output() editMemberEmiter = new EventEmitter();

    constructor(private modalService: NgbModal) {}

    ngOnInit() {
    }

    open(content) {
        this.formatDate('object');
        this.modalReference = this.modalService.open(content, { size: 'xl' as 'lg' });

        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

    setEndDateEqualFrom(){
        if(this.expiredDateModel && this.expiredDateModel.year && this.expiredDateModel.month && this.expiredDateModel.day &&
            this.startDateModel && this.startDateModel.year && this.startDateModel.month && this.startDateModel.day){
            let startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
            let endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
            if(startDate > endDate){
                this.expiredDateModel = this.startDateModel;
            }
            this.isDateError = false;
        }
    }

    validateDates(){
        if(this.expiredDateModel && this.startDateModel){
            let startDate;
            let endDate;
            startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
            endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
            if(startDate > endDate){
                this.isDateError = true;
            } else {
                this.isDateError = false;
            }
        }
    }

    decideClosure(event, datepicker) {
        const path = event.composedPath().map(p => p.localName);
        if (!path.includes('ngb-datepicker')) {
            datepicker.close();
        }
    }

    save(memberForm: NgForm) {
        this.submitted = true;
        this.edit = true;
        if (memberForm.valid && !this.isDateError) { // submit form if valid
          this.formatDate('string');
          this.editMemberEmiter.emit(this.user);
          this.close();
        } else {
            this.submitted = false;
        }
    }

    formatDate(type){
      if (type == 'object') {
        if(this.user.committee_user_start_date) {
          let startDate = new Date(this.user.committee_user_start_date);
          this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
        }
        if (this.user.committee_user_expired_date) {
          let endDate = new Date(this.user.committee_user_expired_date);
          this.expiredDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
        }
      } else {
        if (this.startDateModel){
          this.user.committee_user_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
        } else {
          this.user.committee_user_start_date = null;
        }
        if (this.expiredDateModel){
          this.user.committee_user_expired_date = this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
        } else {
          this.user.committee_user_expired_date = null;
        }
      }
    }

    close () {
        this.expiredDateModel = null;
        this.startDateModel = null;
        this.isDateError = false;
        this.submitted = false;
        this.edit = false;
        this.modalReference.close();
    }

    clearDate(type){
        if (type == 'startDate') {
            this.startDateModel = null;
        }
        if (type == 'endDate') {
            this.expiredDateModel = null;
        }
        this.isDateError = false;
        this.validateDates();
    }

}
