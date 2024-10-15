import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrganizationsPageComponent } from './organizations-page.component';
import { OrganizationPageComponent } from './organization/organization-page.component';
import { OrganizationListPageComponent } from './organization-list/organization-list-page.component';
import { OrganizationsModule } from '../../components/organizations/organizations.module';
import { Right } from './../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component: OrganizationsPageComponent,
		children: [
			{
				path: 'requests',
				component: OrganizationListPageComponent,
				data: {
					right: Right.REQUESTS
				}
			},
			{
				path: '1',
				component: OrganizationListPageComponent,
				data: {
					right: Right.APPROVEDORGANISATIONS
				}
			},
			{
				path: '0',
				component: OrganizationListPageComponent,
				data: {
					right: Right.REJECTEORGANISATIONS
				}
			},
			{
				path: 'edit/:id',
				component: OrganizationPageComponent,
				data: {
					right: Right.ORGANIZATIONEDIT
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		OrganizationsModule

	],
	declarations: [
        OrganizationsPageComponent, OrganizationPageComponent, OrganizationListPageComponent
    ],
    providers: [],
})

export class OrganizationsPageModule { }
