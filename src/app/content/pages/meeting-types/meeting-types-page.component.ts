import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-meeting-types-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingTypesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
