import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FaqSection } from '../../../../core/models/faq-section';
import { Page } from '../../../../core/models/page';
import { FaqService } from '../../../../core/services/faq/faq.service';
import { LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TutorialModalComponent } from '../tutorial-modal/tutorial-modal.component';

@Component({
	selector: 'm-faqs',
	templateUrl: './faqs.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class FaqsComponent implements OnInit {

	faqTree: Array<FaqSection> = [];
	isArabic: boolean;

	constructor(private route: ActivatedRoute,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _faqService: FaqService,
		private _translationService: TranslationService) { }

	ngOnInit() {
		this.isArabic = this._translationService.isArabic();
		this.getFaqTree();
	}


	getFaqTree() {
		this._faqService.getFaqTree().subscribe(res => {
			this.faqTree = res;
		});
	}

}
