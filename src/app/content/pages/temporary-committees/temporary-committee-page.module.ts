import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Right } from './../../../core/models/enums/rights';
import { TemporaryCommitteeListPageComponent } from './temporary-committee-list-page/temporary-committee-list.component';
import { TemporaryCommitteesPageComponent } from './temporary-committee-page.component';
import { CommitteesModule } from '../../components/committees/committees.module';
import { ViewTemporaryCommitteeDetailsPageComponent } from './view-temporary-committee-details-page/view-temporary-committee-details-page.component';

const routes: Routes = [
	{
		path: '',
		component: TemporaryCommitteesPageComponent,
		children: [
			{
				path: '',
				component: TemporaryCommitteeListPageComponent,
				data: {
					right: Right.TemporaryCommittees
				}
			},
			{
				path: 'view/:id',
				component: ViewTemporaryCommitteeDetailsPageComponent,
				data: {
					right: Right.TemporaryCommittees
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		CommitteesModule

	],
	declarations: [
        TemporaryCommitteesPageComponent, TemporaryCommitteeListPageComponent, ViewTemporaryCommitteeDetailsPageComponent
    ],
    providers: [],
})

export class TemporaryCommitteesPageModule { }