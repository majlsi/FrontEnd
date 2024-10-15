import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-decisions-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class DecisionsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
