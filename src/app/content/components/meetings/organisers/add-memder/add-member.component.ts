import { Component, Inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

// Models
import { User } from '../../../../../core/models/user';
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';

// Services
import { UserService } from '../../../../../core/services/security/users.service';
import { TranslationService } from '../../../../../core/services/translation.service';

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

    @Output() AddMemberEmiter = new EventEmitter();
	@Input() member_users: Array<User>;
    @Input() canEditMeeting: boolean;
    meetingStatuses = MeetingStatuses;

	displayedColumns = ['select', 'name', 'email'];
	isArabic: boolean;

    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService) { }

	ngOnInit() {
	}

	open(content) {
        this.getSearchForUsers('');
        this.getLanguage();
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
		this._userService.getMatchedOrganizationUsers({name: userName}).subscribe(res => {
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
			this.selectedUsers.push(user);
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

        if (memberForm.valid) { // submit form if valid

            this.member_users.forEach(memberUser => {
                this.selectedUsers.push(memberUser);
            });
            this.AddMemberEmiter.emit(this.selectedUsers);
            this.close();
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
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

}
