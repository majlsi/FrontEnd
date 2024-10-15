import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Right } from './../../../core/models/enums/rights';
import { StakeholdersPageComponent } from './stakeholders-page.component';
import { StakeholdersListPageComponent } from './stakeholders-list/stakeholders-list-page.component';
import { StakeholderPageComponent } from './stakeholder/stakeholder-page.component';
import { StakeholdersModule } from '../../components/stakeholders/stakeholders.module';

const routes: Routes = [
  {
    path: '',
    component: StakeholdersPageComponent,
    children: [
      {
        path: '',
        component: StakeholdersListPageComponent,
        data: {
          right: Right.STAKEHOLDER_LIST
        }
      },
      {
        path: 'add',
        component: StakeholderPageComponent,
        data: {
          right: Right.STAKEHOLDER_ADD
        }
      },
      {
        path: 'edit/:id',
        component: StakeholderPageComponent,
        data: {
          right: Right.STAKEHOLDER_EDIT
        }
      },

    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    StakeholdersModule

  ],
  declarations: [
    StakeholdersPageComponent, StakeholderPageComponent, StakeholdersListPageComponent
  ],
  providers: [],
})

export class StakeholdersPageModule { }
