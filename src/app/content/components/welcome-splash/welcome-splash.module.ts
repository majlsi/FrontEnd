import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeSplashComponent } from './welcome-splash.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { CoreModule } from '../../../core/core.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Step1IntroComponent } from './step1-intro/step1-intro.component';
import { Step2OrganizationSetUpComponent } from './step2-organization-set-up/step2-organization-set-up.component';
import { Step3AddMembersComponent } from './step3-add-members/step3-add-members.component';
import { Step4ConfirmComponent } from './step4-confirm/step4-confirm.component';
import { PartialsModule } from '../../partials/partials.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserGuideFilesComponent } from './user-guide-files/user-guide-files.component';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    CoreModule,
    RouterModule,
    TranslateModule,
    NgbModule,
    MatStepperModule,
    FormsModule,
    PartialsModule,
    NgSelectModule,
    MatTooltipModule,
  ],
  declarations: [WelcomeSplashComponent, Step1IntroComponent, Step2OrganizationSetUpComponent, Step3AddMembersComponent,
    Step4ConfirmComponent, UserGuideFilesComponent],
  exports: [WelcomeSplashComponent]
})
export class WelcomeSplashModule { }
