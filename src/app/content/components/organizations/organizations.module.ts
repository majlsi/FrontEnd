import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization/organization.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ngx-custom-validators';
import { TranslateModule } from '@ngx-translate/core';
import { DlDateTimeDateModule } from 'angular-bootstrap-datetimepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivateOrganizationComponent } from './activate-organization/activate-organization.component';
@NgModule({
    imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatCheckboxModule,
		MatSortModule,
		FormsModule,
		NgSelectModule,
		NgbCollapseModule,
		CustomFormsModule,
		MatTooltipModule,
		TranslateModule,
		DlDateTimeDateModule,
		NgbModule
	],
	declarations: [
       OrganizationComponent, OrganizationListComponent, ActivateOrganizationComponent
	],
	exports: [ OrganizationComponent, OrganizationListComponent, ActivateOrganizationComponent],
    providers: [],
})

export class OrganizationsModule { }
