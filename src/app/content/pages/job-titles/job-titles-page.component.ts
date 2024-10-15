import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-job-titles-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class JobTitlesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
