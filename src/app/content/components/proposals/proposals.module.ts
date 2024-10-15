import { NgModule } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PartialsModule } from '../../partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProposalComponent } from './proposal/proposal.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CKEditorModule } from 'ngx-ckeditor';
@NgModule({
    imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		FormsModule,
		NgbAccordionModule,
		NgbCollapseModule,
		TranslateModule.forChild(),
		NgSelectModule,
		CKEditorModule
	],
	declarations: [
		ProposalComponent, ProposalListComponent
	],
	exports: [ProposalComponent, ProposalListComponent],

    providers: []
})

export class ProposalsModule { }
