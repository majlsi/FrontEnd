import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaTemplatesPageComponent } from './agenda-templates-page.component';
import { AgendaTemplateListPageComponent } from './agenda-template-list/agenda-template-list-page.component';
import { Routes, RouterModule } from '@angular/router';
import { Right } from '../../../core/models/enums/rights';
import { AgendaTemplatePageComponent } from './agenda-template/agenda-template-page.component';
import { AgendaTemplatesModule } from '../../components/agenda-templates/agenda-templates.module';

const routes: Routes = [
	{
		path: '',
		component: AgendaTemplatesPageComponent,
		children: [

			{
				path: '',
				component: AgendaTemplateListPageComponent,
				data: {
					right: Right.AGENDATEMPLATELIST
				},
			},
			{
				path: 'add',
				component: AgendaTemplatePageComponent,
				data: {
					right:  Right.AGENDATEMPLATEADD
				}
			},
			{
				path: 'edit/:id',
				component: AgendaTemplatePageComponent,
				data: {
					right: Right.AGENDATEMPLATEEDIT
				}
			},

		]
	}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AgendaTemplatesModule
  ],
  declarations: [AgendaTemplatesPageComponent, AgendaTemplateListPageComponent, AgendaTemplatePageComponent]
})
export class AgendaTemplatesPageModule { }
