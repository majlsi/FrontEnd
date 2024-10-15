import { Component, Inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

// Models
import { User } from '../../../../core/models/user';

// Services
import { UserService } from '../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'm-activate-organization',
    templateUrl: './activate-organization.component.html'
})
export class ActivateOrganizationComponent implements OnInit {
    users: Array<User> = [];
    closeResult: string;
    selectedAll: boolean = false;
    user: string;
    selectedUsers: Array<User> = [];
    submitted: boolean = false;
    edit: boolean = false;
    atLeastOneSelected: boolean = false;
    isArabic: boolean;
    activateData: any;
    @Input() organizationsIds: Array<Number>;
    @Input() organizationsSelected: Array<any>;
    @Input() activeDeactiveGroup: boolean;
    @Input() organization: any;
    @Output() getListEmiter = new EventEmitter();
    expiryDateFrom: { day: number; month: number; year: number; };
    expiryDateTo: Date;
    maxLicenseDurationNum: number;

    modalReference: NgbModalRef;


    storageQuota = environment.storageQuota;
    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService,
        private _organizationService: OrganizationService,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) { }

    ngOnInit() {
        this.getLanguage();
        this.maxLicenseDurationNum = (9999 - new Date().getFullYear() - 1) * 365;
        this.activateData = {};
        this.activateData.organizations_ids = this.organizationsIds;
        this.activateData.is_active = true;
        this.activateData.is_stakeholder_enabled = null;
        this.activateData.stakeholders_count = 0;
        let date;
        if (this.organization) {
            if (this.organization.expiry_date_from) {
                date = new Date(this.organization.expiry_date_from);
                this.activateData.licenseDuration = this.organization.licenseDuration;
                this.activateData.directory_quota = this.organization.directory_quota;
                this.setDateModel();
            } else {
                date = new Date();
            }
        } else if (this.organizationsSelected.length === 1) {
            if (this.organizationsSelected[0].expiry_date_from) {
                date = new Date(this.organizationsSelected[0].expiry_date_from);
                this.activateData.licenseDuration = this.organizationsSelected[0].licenseDuration;
                this.activateData.directory_quota = this.organizationsSelected[0].directory_quota;
                this.setDateModel();
            } else {
                date = new Date();
            }
        } else {
            date = new Date();
        }

        this.expiryDateFrom = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
        this.setDateModel();

    }

    open(content) {
        this.activateData = {};
        this.activateData.organizations_ids = this.organizationsIds;
        this.activateData.is_active = true;
        this.activateData.is_stakeholder_enabled = null;
        this.activateData.stakeholders_count = 0;
        let date;
        if (this.organization) {
            if (this.organization.expiry_date_from) {
                date = new Date(this.organization.expiry_date_from);
                this.activateData.licenseDuration = this.organization.licenseDuration;
                this.activateData.directory_quota = this.organization.directory_quota;
                this.setDateModel();
            } else {
                date = new Date();
            }
            this.activateData.organization_number_of_users = this.organization.organization_number_of_users;
        } else if (this.organizationsSelected.length === 1) {
            if (this.organizationsSelected[0].expiry_date_from) {
                date = new Date(this.organizationsSelected[0].expiry_date_from);
                this.activateData.licenseDuration = this.organizationsSelected[0].licenseDuration;
                this.activateData.directory_quota = this.organizationsSelected[0].directory_quota;
                this.setDateModel();
            } else {
                date = new Date();
            }
            this.activateData.organization_number_of_users = this.organizationsSelected[0].organization_number_of_users;
        } else {
            date = new Date();
        }

        this.expiryDateFrom = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
        this.setDateModel();
        this.modalReference = this.modalService.open(content);
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


    save(memberForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (memberForm.valid) { // submit form if valid
            this._organizationService.updateOrganizationActiveState(this.activateData)
                .subscribe(pagedData => {
                    const _activationMessage = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEMESSAGELIST');
                    this.layoutUtilsService.showActionNotification(_activationMessage, MessageType.Update);
                    this.getListEmiter.emit();
                    this.close();
                },
                    error => {
                        const _message = this.translate.instant('ORGANIZATIONS.DELETE.MESSAGE');
                        this.layoutUtilsService.showActionNotification(_message);
                    });
        } else {
            this.submitted = false;
        }
    }

    setDateModel() {
        if (this.expiryDateFrom != null) {
            if (this.expiryDateFrom.year != null) {
                this.activateData.expiry_date_from =
                    this.expiryDateFrom.year + '-' + this.expiryDateFrom.month + '-' + this.expiryDateFrom.day;
                const expiryDateFrom = new Date(this.activateData.expiry_date_from);
                if (this.activateData.licenseDuration) {
                    this.expiryDateTo = new Date(expiryDateFrom.setDate(expiryDateFrom.getDate() + this.activateData.licenseDuration));
                    // tslint:disable-next-line:max-line-length
                    this.activateData.expiry_date_to = this.expiryDateTo.getFullYear() + '-' + (this.expiryDateTo.getMonth() + 1) + '-' + this.expiryDateTo.getDate();
                }
            }

        }

    }

    hasError(memberForm: NgForm, field: string, validation: string) {
        if (memberForm && Object.keys(memberForm.form.controls).length > 0 &&
            memberForm.form.controls[field].errors && validation in memberForm.form.controls[field].errors) {
            if (validation) {
                return (memberForm.form.controls[field].dirty &&
                    // tslint:disable-next-line:max-line-length
                    memberForm.form.controls[field].errors[validation]) || (this.edit && memberForm.form.controls[field].errors[validation]);
            }
            return (memberForm.form.controls[field].dirty &&
                memberForm.form.controls[field].invalid) || (this.edit && memberForm.form.controls[field].invalid);
        }
    }

    close() {
        this.submitted = false;
        this.edit = false;
    }

    getLanguage() {
        this.isArabic = this._translationService.isArabic();
    }

}
