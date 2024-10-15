import { Component, Inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

// Models
import { User } from '../../../../core/models/user';

// Services
import { UserService } from '../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Observable, forkJoin } from 'rxjs';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { ActivatedRoute } from '@angular/router';
import { CommitteeRequestService } from '../../../../core/services/request/committeeRequest.service';
import { Committee } from '../../../../core/models/committee';
import { AdminRequest } from '../../../../core/models/admin-request';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { LdapUsersService } from '../../../../core/services/ldap-users/ldap-users.service';

@Component({
	selector: 'm-add-member',
	templateUrl: './add-member.component.html'
})
export class AddMemberComponent implements OnInit {
    users: Array<User> = [];
    closeResult: string;
    selectedAll: boolean = false;
    user: string;
    selectedUsers: Array<User> = [];
    submitted: boolean = false;
    edit: boolean = false;
    atLeastOneSelected: boolean = false;
    isArabic: boolean;
    isFirstStep: boolean = true;
    startDateModel: any;
    expiredDateModel: any;
    isDateError: boolean = false;
    @Output() AddMemberEmiter = new EventEmitter();
    @Input() member_users: Array<User>;
	@Input() committee_head: User;
	@Input() committee_organiser: User;
    @Input() isFreezed: boolean;
    @Input() committee: Committee;
	displayedColumns = ['select', 'name', 'email'];
    attachmentTypeError: boolean = false;
	attachmentExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
    attachmentSizeError: string = '';
    attachmentEvidenceUrl:string;
	attachmentEvidenceUrlObs: Observable<any>;
	attachmentEvidenceChangedEvent: any;
    customSettingObs:Observable<any>;
    customSetting:boolean;
    editMode:boolean=false;
    LdapSettingObs: Observable<any>;
    ldapSetting: boolean;
    request=new AdminRequest()
    @Output() EvidenceDocumentEmitter: EventEmitter<string> = new EventEmitter<string>();
    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService,private _uploadService: UploadService,
        private _environmentVariableService :EnvironmentVariableService,
        private route: ActivatedRoute,
        private _requestService:CommitteeRequestService,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService,
        private _ldapUsersService: LdapUsersService,
        ) { }

	ngOnInit() {
        this.getLanguage();
        this.getAddUserFeatureVariable();
        this.getLdapIntegrationFeatureVariable();
		forkJoin([this.customSettingObs,this.LdapSettingObs])
		.subscribe(([customSettingRes,LdapSettingRes]) => {
			this.customSetting=customSettingRes.addUserFeature;
            this.ldapSetting=LdapSettingRes.ldapIntegration;
		}
		,
		error => {
		  });
        this.route.params.subscribe(params => {
			if (params['id']) {
				this.editMode=true;
			}
		});
	}

	open(content) {
        this.getSearchForUsers('');
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then((result) => {
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

    getSearchForUsers(userName) {
		this.selectedUsers = [];
		this._userService.getMatchedOrganizationUsers({name: userName}).subscribe(res => {
            if (this.committee_head) {
                const headId = this.committee_head.id;
                const key = res.findIndex(function (value: any) { return value.id === headId; });
                if (key > -1) {
                    res.splice(key, 1);
                }
			}
			// if (this.committee_organiser) {
            //     const organiserId = this.committee_organiser.id;
            //     const key = res.findIndex(function (value: any) { return value.id === organiserId; });
            //     if (key > -1) {
            //         res.splice(key, 1);
            //     }
            // }
            if (this.member_users) {
                this.member_users.forEach(memberUser => {
                    const key = res.findIndex(function (value: any) { return value.id === memberUser.id; });
                    if (key > -1) {
                        res.splice(key, 1);
                    }
                });
            }

            this.users = res;
		}, error => {

		});
    }

    private searchForUsersInLdap(userName: string): Observable<any> {
		const encodedUserName = encodeURIComponent(userName);
		const requestBody = { userName: encodedUserName }
		return this._ldapUsersService.getLdapUser(requestBody);
	}

    selectAll() {
        if (this.selectedAll === true) {
            this.atLeastOneSelected = true;
			this.users.forEach(user => {
				user.is_selected = true;
				const index = this.selectedUsers.indexOf(user);
				if (index === -1) {
					this.selectedUsers.push(user);
				}
			});
		} else {
			this.users.forEach(user => {
				user.is_selected = false;
            });
            this.selectedUsers = [];
            this.atLeastOneSelected = false;
		}
    }

    selectUser(user: User) {
        if (user.is_selected) {
            if(!user.hasOwnProperty('id')&& this.ldapSetting)
            {
                this.searchForUsersInLdap(user.username).subscribe(
                    (data: User) => {
                        if (data.hasOwnProperty('id') && data.id !== undefined)
                        { 
                            this.selectedUsers.push(data);
                        }
                    },
                    (error) => {
                    }
                )
            }
            else
            {
                this.selectedUsers.push(user);
            }
            this.atLeastOneSelected = true;
		} else {
			const key = this.selectedUsers.indexOf(user);
			this.selectedUsers.splice(key, 1);
			if (this.selectedUsers.length === 0) {
				this.atLeastOneSelected = false;
            }
            
            
		}
    }

    save(memberForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (memberForm.valid && !this.isDateError) { // submit form if valid
            if (this.startDateModel || this.expiredDateModel){
                this.selectedUsers.forEach((user,key) => {
                    this.selectedUsers[key] = this.formatDate(user);
                });
            }
            if (this.attachmentEvidenceUrl) {
                this.uploadEvidenceDocument(this.attachmentEvidenceChangedEvent);
                forkJoin(this.attachmentEvidenceUrlObs).subscribe(
                    data => {
                        this.selectedUsers.forEach(user => {
                            user.evidence_document_url = data[0].url;
                        });
                        if(this.customSetting&&this.edit&&this.editMode)
                        {
                            this.addCommitteeMembersRequest();
                        }
                            this.emitUsers();
                    },
                    error => {
                        this.submitted = false;
                    }
                );
            } else {
                if(this.customSetting&&this.edit&&this.editMode)
                {
                    this.addCommitteeMembersRequest();
                }
                    this.emitUsers();
            }
        } else {
            this.submitted = false;
        }
    }

    hasError(memberForm: NgForm, field: string, validation: string) {
		if (memberForm && Object.keys(memberForm.form.controls).length > 0 &&
		memberForm.form.controls[field].errors && validation in memberForm.form.controls[field].errors) {
            if (validation) {
				return (memberForm.form.controls[field].dirty &&
					memberForm.form.controls[field].errors[validation]) || (this.edit && memberForm.form.controls[field].errors[validation]);
            }
			return (memberForm.form.controls[field].dirty &&
				memberForm.form.controls[field].invalid) || (this.edit && memberForm.form.controls[field].invalid);
        }
    }

    close () {
        this.user = null;
        this.selectedAll = false;
        this.selectedUsers = [];
        this.submitted = false;
        this.edit = false;
        this.atLeastOneSelected = false;
        this.isFirstStep = true;
        this.expiredDateModel = null;
        this.startDateModel = null;
        this.isDateError = false;
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }

    nextStep() {
        if (this.atLeastOneSelected){
            this.isFirstStep = false;
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

    decideClosure(event, datepicker) {
        const path = event.composedPath().map(p => p.localName);
        if (!path.includes('ngb-datepicker')) {
            datepicker.close();
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

    formatDate(user: User){
        if (this.startDateModel){
            user.committee_user_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
        }
        if (this.expiredDateModel){
            user.committee_user_expired_date = this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
        }
        return user;
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

    fileEvidenceUrlChangeEvent(event: any): void {
		this.attachmentSizeError = '';
		this.attachmentTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.attachmentEvidenceChangedEvent = event.target.files[0];
			this.attachmentEvidenceUrl = event.target.files[0].name;
			this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.attachmentEvidenceUrl = null;
			this.attachmentEvidenceChangedEvent = null;
		}
    }

    uploadEvidenceDocument (file: File) {
        if (file) {
            this.attachmentEvidenceUrlObs = this._uploadService.uploadEvidenceDocument<File>(file);
        }
    }

    getAddUserFeatureVariable()
	{
		this.customSettingObs=this._environmentVariableService.getAddUserFeatureVariable();
	}

    emitUsers()
    {
        this.member_users.forEach(memberUser => {
            this.selectedUsers.push(memberUser);
        });
        this.AddMemberEmiter.emit(this.selectedUsers);
        this.close();
    }

    async addCommitteeMembersRequest(){
        if(this.ldapSetting)
        {
            await this.addCommitteeMembersRequestWhileLdapActive();
        }
            let data= {
                  committee_id: this.committee.id,
                  committee_name:this.committee.committee_name_en,
                  committee_name_ar:this.committee.committee_name_en,
                  member_users:this.selectedUsers
                };
      
              this._requestService.addCommitteeMembersRequest(data).subscribe(
                  res => {
                      
                      
                      const _successMessage = this.translate.instant('REQUEST.ADD.ADDCOMMITTEEMEMBERREQUESTSUCCESS');
                      this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
                      this.AddMemberEmiter.emit(this.member_users);
                  }, err => {
                    this.submitted = false;
                  }
                );
        
	}


    async addCommitteeMembersRequestWhileLdapActive(){
        this.selectedUsers.forEach(user => {
            if (!user.hasOwnProperty('id')) {
                this.searchForUsersInLdap(user.username).subscribe(
                    (data: User) => {
                        if (data.hasOwnProperty('id') && data.id !== undefined) {
                            this.selectedUsers.push(data);
                        }
                    },
                    (error) => {
                        // Handle error if needed
                    }
                );
            }
        });
    }
    getLdapIntegrationFeatureVariable() {
		this.LdapSettingObs = this._environmentVariableService.getLdapIntegrationFeatureVariable();
	}
}
