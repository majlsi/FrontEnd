import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CircularDecisionsPageComponent } from './circular-decisions-page.component';
import { CircularDecisionListPageComponent } from './circular-decision-list/circular-decision-list-page.component';
import { Right } from './../../../core/models/enums/rights';
import { CircularDecisionPageComponent } from './circular-decision/circular-decision-page.component';
import { CircularDecisionsModule } from '../../components/circular-decisions/circular-decisions.module';
import { NgbCollapseModule, NgbModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { MatTabsModule } from "@angular/material/tabs";
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { CircularDecisionDetailsPageComponent } from './circular-decision-details/circular-decision-details-page.component';
import { CircularDecisionTasksPageComponent } from './circular-decision-tasks/circular-decision-tasks-page.component';
import { JoyrideModule } from 'ngx-joyride';

const routes: Routes = [
	{
		path: '',
		component: CircularDecisionsPageComponent,
		children: [
			{
				path: '',
				component: CircularDecisionListPageComponent,
				data: {
					right: Right.CIRCULAR_DECISIONS_LIST
				}
            },
            {
                path: 'add',
                component: CircularDecisionPageComponent,
                data: {
                    right: Right.ADD_CIRCULAR_DECISION
                }
            },
            {
                path: 'edit/:id',
                component: CircularDecisionPageComponent,
                data: {
                    right: Right.EDIT_CIRCULAR_DECISION
                }
            },
            {
                path: 'details/:id',
                component: CircularDecisionDetailsPageComponent,
                data: {
                    right: Right.DECISION_DETAILS
                }
            },
            {
                path: 'tasks/:id',
                component: CircularDecisionTasksPageComponent,
                // data: {
                //     right: Right.DECISION_TASKS
                // }
            }
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
        CircularDecisionsModule,
        NgSelectModule,
        FormsModule,
        PartialsModule,
        NgbCollapseModule, 
        NgbModule, 
        NgbNavModule,
        MatTabsModule,
        TranslateModule,
        JoyrideModule
	],
	declarations: [
        CircularDecisionsPageComponent, CircularDecisionListPageComponent, CircularDecisionPageComponent,
        CircularDecisionDetailsPageComponent, CircularDecisionTasksPageComponent
    ],
    providers: [],
})

export class CircularDecisionsPageModule { }
