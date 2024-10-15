import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'm-rename-modal',
  templateUrl: './rename-modal.component.html',
})
export class RenameModalComponent implements OnInit {

  public name = '';
  edit: boolean;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }
	hasError(form: NgForm, field: string, validation: string) {
		if (form && Object.keys(form.form.controls).length > 0 &&
    form.form.controls[field].errors && validation in form.form.controls[field].errors) {
			if (validation) {
				return (form.form.controls[field].dirty &&
					form.form.controls[field].errors[validation]) || (this.edit && form.form.controls[field].errors[validation]);
			}
			return (form.form.controls[field].dirty &&
				form.form.controls[field].invalid) || (this.edit && form.form.controls[field].invalid);
		}
	}
  save(form: NgForm) {
    this.edit = true;
    if (form.valid) {
      this.activeModal.close(this.name);
    }
  }
}
