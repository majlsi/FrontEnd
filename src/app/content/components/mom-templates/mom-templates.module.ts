import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template/template.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../../core/core.module';
import { JoyrideModule } from 'ngx-joyride';
import { PartialsModule } from '../../partials/partials.module';

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
		NgbModule,
		CoreModule,
		JoyrideModule
	],
	declarations: [TemplateComponent, TemplateListComponent],

	exports: [TemplateComponent, TemplateListComponent],
})
export class MomTemplatesModule { }
