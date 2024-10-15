import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Approval } from '../../../../core/models/approval';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'm-step3-approval-summary',
  templateUrl: './step3-approval-summary.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Step3ApprovalSummaryComponent {

	isArabic: boolean;
	committeeLabel: string = "committee_name_ar";
	userLabel: string = 'name_ar';
	@Input() approvalId: any;
	approval: any;

	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private _translationService: TranslationService,
		private _crudService: CrudService) {}

	ngOnInit() {
		this.getLanguage();

		this.route.params.subscribe(params => {
			if (params['id']) {
				this.approvalId = +params['id']; // (+) converts string 'id' to a number
				this.getApproval();
				// this.getCurrentUser();
				// forkJoin([this.documentObs,this.userObs])
				// .subscribe(data => {
				// 	this.document = data[0];
				// 	this.user = data[1].user;

				// });
			}
		});

		
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

  	getApproval() {
		this._crudService.get<Approval>('admin/approvals',this.approvalId).subscribe(res => {
			this.approval = res;
		}, error => {
		});
	}

  	redirect() {
		this.router.navigate(["/approvals"]);
	}

	back() {
		this.tabChanged.emit('TAB2');
	}

}
