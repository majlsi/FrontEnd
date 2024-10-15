import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { NgForm } from '@angular/forms';
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { Task } from '../../../../core/models/task';
import { TaskStatus } from '../../../../core/models/task-status';
import { User } from '../../../../core/models/user';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { LdapUsersService } from '../../../../core/services/ldap-users/ldap-users.service';
import { Observable, forkJoin } from 'rxjs';
import { UserService } from '../../../../core/services/security/users.service';


@Component({
	selector: 'm-task',
	templateUrl: './task.component.html'
})


export class TaskComponent implements OnInit {

	isArabic: boolean = false;
	submitted: boolean = false;
	@Input() taskId: number;
	@Input() agendas: Array<MeetingAgenda> = [];
	@Input() users: Array<User> = [];
	@Input() meetingId;
	@Input() voteId;
	@Input() taskStatus: Array<TaskStatus> = [];
	@Input() task = new Task();
	agendabindLabel: string;

	@Output() resetAddFirst = new EventEmitter();
	@Output() callList = new EventEmitter();
	@Output() newTaskAded = new EventEmitter();
	@Output() cancelAdd = new EventEmitter();
	@Output() closeModal = new EventEmitter();

	edit: boolean = false;
	bindLabelTaskStatus: string = 'task_status_name_ar';
	bindLabelUserName: string = 'name_ar';
    LdapSettingObs: Observable<any>;
	ldapSetting: boolean;
	constructor(
		private _translationService: TranslationService,
		private crudService: CrudService,
		private _environmentVariableService: EnvironmentVariableService,
        public _ldapUsersService: LdapUsersService,
		private cdRef: ChangeDetectorRef,
		private _userService: UserService,
	) { }

	ngOnInit() {
		this.getLanguage();
		if(this.meetingId){
			this.task.meeting_id = this.meetingId;
		}
		if(this.voteId){
			this.task.vote_id = this.voteId;
		}
		if (this.taskId) {
			// clone the object to avoid exception in list page
			this.task = {...this.task};
			this.task.start_date = JSON.parse(this.task.start_date_formated);
		}
		this.getLdapIntegrationFeatureVariable();
        forkJoin([this.LdapSettingObs])
		.subscribe(([LdapSettingRes]) => {
            this.ldapSetting=LdapSettingRes.ldapIntegration;
		}
		,
		error => {
		  });
	}

	cancelTask(taskForm) {
		this.resetAddFirst.emit();
		this.resetForm(taskForm);
		this.cancelAdd.emit();
		this.closeModal.emit();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === false) {
			this.bindLabelTaskStatus = 'task_status_name_en';
			this.bindLabelUserName = 'name';
		}
	}

	save(taskForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (taskForm.valid) {
			if (this.taskId) { // if edit
				this.crudService.edit<Task>('admin/task-management', this.task, this.taskId).subscribe(
					data => {
						this.closeModal.emit();
					},
					error => {
						this.submitted = false;
					});
			} else { // if add
				this.crudService.add<Task>('admin/task-management', this.task).subscribe(
					data => {
						this.resetForm(taskForm);
						this.callList.emit();
						this.newTaskAded.emit();
					},
					error => {
						this.submitted = false;
					});
			}
		} else {
			this.submitted = false;
		}
	}

	resetForm(myForm) {
		this.submitted = false;
		this.edit = false;
		this.task = new Task();
		if(this.meetingId){
			this.task.meeting_id = this.meetingId;
		}
		if(this.voteId){
			this.task.vote_id = this.voteId;
		}
		myForm.form.markAsPristine();
	}


	hasError(taskForm: NgForm, field: string, validation: string) {
		if (taskForm && Object.keys(taskForm.form.controls).length > 0 &&
			taskForm.form.controls[field].errors && validation in taskForm.form.controls[field].errors) {
			if (validation) {
				return (taskForm.form.controls[field].dirty &&
					taskForm.form.controls[field].errors[validation]) || (this.edit && taskForm.form.controls[field].errors[validation]);
			}
			return (taskForm.form.controls[field].dirty &&
				taskForm.form.controls[field].invalid) || (this.edit && taskForm.form.controls[field].invalid);
		}
	}

	public prepareUsersDropDown(event = null){
		if(event!== null && this.ldapSetting)
		{
			if(!event.hasOwnProperty('id'))
			{
				this.addLdapUser(event.username).subscribe(
					(user: User) => {
						if (user.hasOwnProperty('id') && user.id !== undefined)
						{
							this.task.assigned_to=user.id;
							this.searchForUsersInLdap(user.username,null)							
							this.cdRef.detectChanges();
						}
					},
					(error) => {
					}
				);
			}
		}
	}
	public searchForUsersInLdap(term: string, item: any) {
		if(term.length!== 0 && this.ldapSetting)
		{
			this._userService.getOrganizationUsersStakeholders({ name: term['term'] }).subscribe(
			(data) => {
				this.users = data
			},
			(error) => {
			}
			)
		}
	}
    private addLdapUser(userName: string): Observable<any> {
		const encodedUserName = encodeURIComponent(userName);
		const requestBody = { userName: encodedUserName }
		return this._ldapUsersService.getLdapUser(requestBody);
	}
    getLdapIntegrationFeatureVariable() {
		this.LdapSettingObs = this._environmentVariableService.getLdapIntegrationFeatureVariable();
	}

}

