import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HistoriesPageComponent } from './history-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { HistoryModule } from '../../components/history/history.module';
import { Right } from '../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component:  HistoryPageComponent,
		children: [
			{
				path: '',
				component:  HistoriesPageComponent,
				data: {
					right: Right.HISTORY
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		HistoryModule
	],
	declarations: [
        HistoriesPageComponent ,  HistoryPageComponent
    ],
    providers: []
})

export class HistoryPageModule { }
