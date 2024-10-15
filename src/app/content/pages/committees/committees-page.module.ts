import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommitteesPageComponent } from './committees-page.component';
import { CommitteePageComponent } from './committee/committee-page.component';
import { CommitteeListPageComponent } from './committee-list/committee-list-page.component';
import { CommitteesModule } from '../../components/committees/committees.module';
import { Right } from './../../../core/models/enums/rights';
import { MyCommitteeListPageComponent } from './my-committee-list/my-committee-list-page.component';

const routes: Routes = [
	{
		path: '',
		component: CommitteesPageComponent,
		children: [
			{
				path: '',
				component: CommitteeListPageComponent,
				data: {
					right: Right.COMMITTEES
				}
			},
			{
				path: 'my-committees',
				component: MyCommitteeListPageComponent,
				data: {
					right: Right.MyCommittees
				}
			},
			{
				path: 'add',
				component: CommitteePageComponent,
				data: {
					right: Right.ADDNEWCOMMITTEE
				}
			},
			{
				path: 'edit/:id',
				component: CommitteePageComponent,
				data: {
					right: Right.COMMITTEEEDIT
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
        CommitteesPageComponent, CommitteePageComponent, CommitteeListPageComponent, MyCommitteeListPageComponent
    ],
    providers: [],
})

export class CommitteesPageModule { }
