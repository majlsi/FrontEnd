import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { JoyrideService } from 'ngx-joyride';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class VideoGuideService {

	guideStepsList: Array<string> = [];
	routeUrl: BehaviorSubject<string> = new BehaviorSubject(null);
    
	constructor(
		private _requestService: RequestService,
		private translate: TranslateService,
		private joyrideService: JoyrideService) {
	}
	
	getVideoIcons() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/video-icons', null, null);
	}

	getTutorialSteps(){
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/tutorial-steps', null, null);
	}

	setGuideStepsList(stepList: Array<string>){
		this.guideStepsList = stepList;
	}

	getGuideStepsList(){
		return this.guideStepsList;
	}

	setRouteUrl(route:  string){
		this.routeUrl.next('/'+route);
	}

	startGuide(tutorialStepsList: Array<string>){
		this.joyrideService.startTour(
			{ 
				startWith: tutorialStepsList[0],
				steps: tutorialStepsList,
				customTexts: {next: this.translate.instant('GENERAL.NEXT'), done: this.translate.instant('BUTTON.DONEBUTTON') },
				showPrevButton:  false,
				waitingTime: 300,
			}
		).subscribe(
            (step) => {
				/*Do something*/
				if(step.number == tutorialStepsList.length){
					this.setGuideStepsList([]);
				}
            },
            (error) => {
				/*handle error*/
            },
            () => {
				/*Tour is finished here, do something*/
				this.setGuideStepsList([]);
            }
        );
	}
}
