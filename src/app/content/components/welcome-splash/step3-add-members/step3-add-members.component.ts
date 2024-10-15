import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { User } from '../../../../core/models/user';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Role } from './../../../../core/models/role';
import { forkJoin, Observable, from } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../core/services/security/users.service';

@Component({
  selector: 'm-step3-add-members',
  templateUrl: './step3-add-members.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Step3AddMembersComponent implements OnInit {

  user = new User();
  submitted: boolean = false;
  userId: number;
  edit: boolean = false;
  showError: boolean = false;
  rolesObs: Observable<Role[]>;
  errors: Array<any>;
  roles: Array<Role> = [];
  users: Array<User> = [];
  isArabic: boolean;
  bindLabel: string = 'role_name_ar';
  @Output() goToNextStep = new EventEmitter();


  constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router,
    private _translationService: TranslationService,
    private layoutUtilsService: LayoutUtilsService,
    private translate: TranslateService,
    private userService: UserService) {

  }

  ngOnInit() {
    this.getLanguage();
    this.getRoles();
    this.route.params.subscribe(params => {
      forkJoin([this.rolesObs])
        .subscribe(data => {
          this.roles = data[0];
          this.roles = this.roles.filter(function (item) {
            return item.can_assign === 1;
          });
          this.addUser();
        },
          error => {
            // console.log('error');
          });
    });

  }

  addUser() {
    this.users.push(new User());
  }

  hasError(userForm: NgForm, field: string, validation: string) {
    if (userForm && Object.keys(userForm.form.controls).length > 0 && userForm.form.controls[field] &&
      userForm.form.controls[field].errors && validation in userForm.form.controls[field].errors) {
      if (validation) {
        return (userForm.form.controls[field].dirty &&
          userForm.form.controls[field].errors[validation]) || (this.edit && userForm.form.controls[field].errors[validation]);
      }
      return (userForm.form.controls[field].dirty &&
        userForm.form.controls[field].invalid) || (this.edit && userForm.form.controls[field].invalid);
    }
  }

  save(userForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    this.showError = false;
    if (userForm.valid) { // submit form if valid
      this.userService.addMultiple(this.users).subscribe(
        data => {

          const _successMessage = this.translate.instant('USERS.ADD.ADDUSERSUCCESSMSG');
          this.submitted = false;
          this.goToNextStep.emit(true);
        },
        error => {
          this.submitted = false;
          this.showError = true;
          this.errors = error;

        });

    } else {
      this.submitted = false;
    }
  }

  getRoles() {
    this.rolesObs = this._crudService.getList<Role>('admin/access-roles');
  }

  getLanguage() {
    this.isArabic = this._translationService.isArabic();
    if (!this.isArabic) {
      this.bindLabel = 'role_name';
    }
  }

  delete(i: number) {
    const _title: string = this.translate.instant('USERS.DELETE.DELETEUSER');
    const _description: string = this.translate.instant('USERS.DELETE.DESCRIPTION');
    const _waitDesciption: string = this.translate.instant('USERS.DELETE.WAITDESCRIPTION');
    const _deleteMessage = this.translate.instant('USERS.DELETE.DELETEMESSAGE');

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.users.splice(i, 1);

    });
  }

}
