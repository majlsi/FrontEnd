import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-view-meetings-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ViewMeetingsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}