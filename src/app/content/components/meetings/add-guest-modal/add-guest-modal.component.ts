import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'default-add-guest-modal',
  templateUrl: './add-guest-modal.component.html',
})
export class AddGuestModalComponent {
  @Input() isArabic: boolean;
  @Input() guest: any;
  @Output() guestInvited = new EventEmitter();

  edit = false;
  guestEmail: string;
  constructor(public activeModal: NgbModal) {

  }


  ngOnInit() {
    if(this.guest?.email){
      this.guestEmail = this.guest.email
    }
  }


  close() {
    this.activeModal.dismissAll();
  }

  save(addForm: NgForm) {
    this.edit = true;
    if(addForm) {
      this.guestInvited.emit(this.guestEmail);
      this.close();
    }
  }

  hasError(addForm: NgForm, field: string, validation: string) {
    if (addForm && Object.keys(addForm.form.controls).length > 0 && addForm.form.controls[field] &&
      addForm.form.controls[field].errors && validation in addForm.form.controls[field].errors) {
      if (validation) {
        return (addForm.form.controls[field].dirty &&
          addForm.form.controls[field].errors[validation]) || (this.edit && addForm.form.controls[field].errors[validation]);
      }
      return (addForm.form.controls[field].dirty &&
        addForm.form.controls[field].invalid) || (this.edit && addForm.form.controls[field].invalid);
    }
  }
}
