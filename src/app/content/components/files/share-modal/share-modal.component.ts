import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { UserService } from '../../../../core/services/security/users.service';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, catchError, tap, filter, map } from 'rxjs/operators';
import { TranslationService } from '../../../../core/services/translation.service';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../core/services/files/file.service';
import { DirectoryService } from '../../../../core/services/files/directory.service';

@Component({
  selector: 'm-share-modal',
  templateUrl: './share-modal.component.html',
})
export class ShareModalComponent implements OnInit {

  edit: boolean;
  oldUsers = [];
  minLengthTerm = 3;
  ownerId;
  loading = false;
  // users$: Observable<any>;

  searchInput$ = new Subject<string>();
  isArabic: boolean;

  isRead = true;
  isEdit = false;
  imageBaseUrl = environment.imagesBaseURL;
  addedUsers = [];
  users = [];

  constructor(public activeModal: NgbActiveModal,
     private userService: UserService,
     private translationService: TranslationService,
     private fileService: FileService, private directoryService: DirectoryService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.loadUsers();
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
      const result = {users: this.addedUsers , edit: this.isEdit};
      this.activeModal.close(result);
    }
  }

  loadUsers() {

    concat(
      of([]), // default items
      this.searchInput$.pipe(
        filter(res => res !== null && res.length >= this.minLengthTerm),
        tap(() => this.loading = true),
        switchMap(term => {

          return this.userService.getMatchedOrganizationUsers({ name: term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.loading = false)
          );
        })
      )
    ).subscribe(res => {
      this.users = res;
    });
  }


  usersResults() {
    return this.users.filter(a => !this.oldUsers.some(old => old.id == a.id) && a.id != this.ownerId);
  }



  remove(index: number) {
    const oldUser = this.oldUsers[index];
    if (oldUser.pivot.file_id) {
      this.fileService.removeShare(oldUser.pivot.file_id, oldUser.pivot.id).subscribe(res => {
        this.oldUsers.splice(index, 1);
      });
    } else {
      this.directoryService.removeShare(oldUser.pivot.directory_id, oldUser.pivot.id).subscribe(res => {
        this.oldUsers.splice(index, 1);
      });
    }
  }

}
