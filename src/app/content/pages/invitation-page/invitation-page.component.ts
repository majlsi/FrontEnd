import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../core/services/security/users.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'm-invitation-page',
  templateUrl: './invitation-page.component.html',
})
export class InvitationPageComponent implements OnInit {
  userName;
  meetingName;
  meetingID;
  error: string = null;
  edit: boolean = false;
  submitted: boolean = false;
  isArabic: boolean = true;
  themeName = environment.themeName;

  constructor(
    private router: Router,
    private _translationService: TranslationService,
    private userService: UserService) {
    if (window.history.state != null && window.history.state.meetingName != null) {
      this.meetingName = window.history.state.meetingName;
      this.meetingID = window.history.state.meetingID;
    }
  }
  ngOnInit(): void {
    this.getLanguage();
    this.userService.GetGuestInfo().subscribe(res => {
      this.userName = res.full_name;
    });
  }

  hasError(loginForm: NgForm, field: string, validation: string) {
    if (loginForm && Object.keys(loginForm.form.controls).length > 0 &&
      loginForm.form.controls[field].errors && validation in loginForm.form.controls[field].errors) {
      if (validation) {
        return (loginForm.form.controls[field].dirty &&
          loginForm.form.controls[field].errors[validation]) ||
          (this.edit && loginForm.form.controls[field].errors[validation]);
      }
      return (loginForm.form.controls[field].dirty &&
        loginForm.form.controls[field].invalid) || (this.edit && loginForm.form.controls[field].invalid);
    }
  }


  submit(loginForm: NgForm) {
    this.edit = true;
    this.submitted = true;

    if (loginForm.valid) {
      this.userService.UpdateGuest({ 'full_name': this.userName }).subscribe(res => {
        this.router.navigate(['view-meetings', this.meetingID]);
      }, err => {
        this.error = err.error;
      });
    }

  }

  getLanguage() {
    this.isArabic = this._translationService.isArabic();
  }

}
