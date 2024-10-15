import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-meeting-absence-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingAbsencePageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
