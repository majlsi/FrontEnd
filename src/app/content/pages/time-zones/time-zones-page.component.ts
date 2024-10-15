import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-time-zones-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class TimeZonesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
