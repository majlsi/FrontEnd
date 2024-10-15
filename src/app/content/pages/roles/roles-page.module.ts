
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RolesPageComponent } from './roles-page.component';
import { RoleListPageComponent } from './role-list/role-list-page.component';
import { RolePageComponent } from './role/role-page.component';
import { RolesModule } from '../../components/roles/roles.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: RolesPageComponent,
		children: [

			{
				path: '',
				component: RoleListPageComponent,
				data: {
					right: Right.ROLESLIST
				},
			},
			{
				path: 'add',
				component: RolePageComponent,
				data: {
					right:  Right.ROLESADD
				}
			},
			{
				path: 'edit/:id',
				component: RolePageComponent,
				data: {
					right: Right.ROLESEDIT
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		RolesModule
	],
	declarations: [
		RolesPageComponent, RoleListPageComponent, RolePageComponent
	],

    providers: []
})

export class RolesPageModule { }
