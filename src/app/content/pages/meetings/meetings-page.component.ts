import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-meetings-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
