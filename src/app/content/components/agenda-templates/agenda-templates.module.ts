import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaTemplateComponent } from './agenda-template/agenda-template.component';
import { AgendaTemplateListComponent } from './agenda-template-list/agenda-template-list.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { PartialsModule } from '../../partials/partials.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { JoyrideModule } from 'ngx-joyride';

@NgModule({
  imports: [
    CommonModule,
    PartialsModule,
		RouterModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		FormsModule,
		NgbAccordionModule,
		NgbCollapseModule,
		TranslateModule.forChild(),
		NgbModule,
		JoyrideModule
  ],
  declarations: [AgendaTemplateComponent, AgendaTemplateListComponent],

  exports: [AgendaTemplateComponent, AgendaTemplateListComponent],
})
export class AgendaTemplatesModule {}
