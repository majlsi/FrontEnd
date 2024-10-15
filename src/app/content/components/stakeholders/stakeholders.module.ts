import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StakeholderComponent } from './stakeholder/stakeholder.component';
import { StakeholderListComponent } from './stakeholder-list/stakeholder-list.component';
import { PartialsModule } from '../../partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { JoyrideModule } from 'ngx-joyride';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImportStakeholdersComponent } from './import-stakeholders/import-stakeholders.component';

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
		NgSelectModule,
		NgbCollapseModule,
		TranslateModule,
		MatTooltipModule,
		JoyrideModule,
		NgbModule
	],
	declarations: [
		StakeholderComponent, StakeholderListComponent, ImportStakeholdersComponent
	],
	exports: [StakeholderComponent, StakeholderListComponent],
	providers: []
})

export class StakeholdersModule { }
