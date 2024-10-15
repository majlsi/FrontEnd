import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-proposals-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProposalsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
