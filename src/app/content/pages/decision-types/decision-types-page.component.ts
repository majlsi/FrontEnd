import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-decision-types-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class DecisionTypesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
