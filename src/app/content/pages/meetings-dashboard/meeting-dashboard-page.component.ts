import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-meeting-dash-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingDashboardPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
