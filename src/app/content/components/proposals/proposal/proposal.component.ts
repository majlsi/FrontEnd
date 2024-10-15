import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Models
import { User } from '../../../../core/models/user';
import { TextEditor } from '../../../../core/config/text-editor';
// Services

import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Proposal } from '../../../../core/models/proposal';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'm-proposal',
    templateUrl: './proposal.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProposalComponent implements OnInit {

    user = new User();
    submitted: boolean = false;
    edit: boolean = false;
    image_url: string;
    imagesBaseURL: string = environment.imagesBaseURL;
    logoImageChangedEvent: any;
    logoImageUrlObs: Observable<any>;
    observableArray: Array<Observable<any>> = [];
    message: string = '';
    type: string = '';
    logoImageSizeError: string = '';
    fileTypeError: boolean = false;
    fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
    accessRights: any;
    isArabic: boolean;
    bindLabel: string = 'right_name_ar';
    lang: string;
    public editorConfig = TextEditor;
    proposal: Proposal = new Proposal();
    errors: any;
    showDescError: boolean;
    proposalId: number;
    constructor(
        private translate: TranslateService,
        private _translationService: TranslationService,
        private layoutUtilsService: LayoutUtilsService,
        private _crudService: CrudService,
        private router: Router,
        private route: ActivatedRoute) {

    }


    ngOnInit() {
        this.getLanguage();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.proposalId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<Proposal>('admin/proposals', this.proposalId).subscribe(
                    res => {
                        this.proposal = res;
                       // console.log(this.proposal);
                    },
                    error => {
                        // console.log('error');
                    });
            }
        },
        error => {
            // console.log('error');
        });
    }

    save(proposalForm: NgForm) {
        this.submitted = true;
        this.showDescError = true;
        this.edit = true;

        if (proposalForm.valid) { // submit form if valid
                this._crudService.add<Proposal>('admin/proposals', this.proposal).subscribe(
                    data => {
                        this.submitted = false;
                        const _message = this.translate.instant('PROPOSALS.ADD.SUCCESSMSG');

                        this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
                        this.proposal = new Proposal;
                        this.edit = false;
                        proposalForm.reset();
                        this.showDescError = false;
                        this.router.navigate(['/proposals']);
                    },
                    error => {
                        this.submitted = false;
                    });

        } else {
            this.showDescError = true;
            this.submitted = false;
        }
    }
    hasError(proposalForm: NgForm, field: string, validation: string) {
        if (proposalForm && Object.keys(proposalForm.form.controls).length > 0 && proposalForm.form.controls[field] &&
            proposalForm.form.controls[field].errors && validation in proposalForm.form.controls[field].errors) {
            if (validation) {
                return (proposalForm.form.controls[field].dirty &&
                    // tslint:disable-next-line:max-line-length
                    proposalForm.form.controls[field].errors[validation]) || (this.edit && proposalForm.form.controls[field].errors[validation]);
            }
            return (proposalForm.form.controls[field].dirty &&
                proposalForm.form.controls[field].invalid) || (this.edit && proposalForm.form.controls[field].invalid);
        }
    }



    getLanguage() {
        this.isArabic = this._translationService.isArabic();
        if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
    }
}
