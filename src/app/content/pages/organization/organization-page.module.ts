import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrganizationPageComponent } from './organization-page.component';
import { ManageOrganizationPageComponent } from './manage-organization/manage-organization-page.component';

import { Right } from '../../../core/models/enums/rights';
import { OrganizationModule } from '../../components/organization/organization.module';

const routes: Routes = [
	{
		path: '',
		component: OrganizationPageComponent,
		children: [
			{
				path: '',
				component: ManageOrganizationPageComponent,
				data: {
					right: Right.MANAGEORGANIZATION
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		OrganizationModule

	],
	declarations: [
        OrganizationPageComponent, ManageOrganizationPageComponent
    ],
    providers: [],
})

export class OrganizationPageModule { }
