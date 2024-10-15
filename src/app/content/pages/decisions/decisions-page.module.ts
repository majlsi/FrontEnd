import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DecisionsPageComponent } from './decisions-page.component';
import { DecisionListPageComponent } from './decision-list/decision-list-page.component';
import { DecisionsModule } from '../../components/decisions/decisions.module';
import { Right } from './../../../core/models/enums/rights';
import { DecisionDetailsPageComponent } from './decision-details-page/decision-details-page.component';

const routes: Routes = [
	{
		path: '',
		component: DecisionsPageComponent,
		children: [
			{
				path: '',
				component: DecisionListPageComponent,
				data: {
					right: Right.DECISIONS_LIST
				}
			},
			// {
			// 	path: 'add',
			// 	component: DecisionPageComponent,
			// 	data: {
			// 		right: Right.DECISIONS_LIST
			// 	}
			// },
			// {
			// 	path: ':id',
			// 	component: DecisionDetailsPageComponent,
			// 	data: {
			// 		right: Right.DECISIONS_LIST
			// 	}
			// },
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		DecisionsModule

	],
	declarations: [
        DecisionsPageComponent, DecisionListPageComponent, DecisionDetailsPageComponent
    ],
    providers: [],
})

export class DecisionsPageModule { }
