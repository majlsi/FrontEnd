import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqsComponent } from './faqs/faqs.component';
import { VideosGuideComponent } from './videos-guide/videos-guide.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
import { TutorialModalComponent } from './tutorial-modal/tutorial-modal.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { NgbModule, NgbAccordionModule, NgbCollapseModule, } from '@ng-bootstrap/ng-bootstrap';
import { TourModalComponent } from './tour-modal/tour-modal.component';
import { CoreModule } from '../../../core/core.module';
import { JoyrideModule } from 'ngx-joyride';

const helpCenterComponents = [ FaqsComponent, VideosGuideComponent ];
@NgModule({
  imports: [
    CommonModule,
	PartialsModule,
	RouterModule,
	TranslateModule,
	YouTubePlayerModule,
	NgbModule,
	NgbAccordionModule,
	NgbCollapseModule,
	CoreModule,
	JoyrideModule
  ],
  declarations: [...helpCenterComponents, TutorialModalComponent, TourModalComponent],
  exports: [
	...helpCenterComponents, TutorialModalComponent, TourModalComponent
  ]
})
export class HelpCenterModule { }
