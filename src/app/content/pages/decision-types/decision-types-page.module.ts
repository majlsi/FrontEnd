import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DecisionTypesPageComponent } from './decision-types-page.component';
import { DecisionTypePageComponent } from './decision-type/decision-type-page.component';
import { DecisionTypeListPageComponent } from './decision-type-list/decision-type-list-page.component';
import { DecisionTypesModule } from '../../components/decision-types/decision-types.module';
import { Right } from './../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component: DecisionTypesPageComponent,
		children: [
			{
				path: '',
				component: DecisionTypeListPageComponent,
				data: {
					right: Right.DECISION_TYPES_LIST
				}
			},
			{
				path: 'add',
				component: DecisionTypePageComponent,
				data: {
					right: Right.ADD_DECISION_TYPE
				}
			},
			{
				path: 'edit/:id',
				component: DecisionTypePageComponent,
				data: {
					right: Right.EDIT_DECISION_TYPE
				}
			},
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		DecisionTypesModule
	],
	declarations: [
        DecisionTypesPageComponent, DecisionTypePageComponent, DecisionTypeListPageComponent
    ],
    providers: [],
})

export class DecisionTypesPageModule { }
