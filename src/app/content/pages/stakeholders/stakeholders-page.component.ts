import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-stakeholders-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class StakeholdersPageComponent implements OnInit {


    constructor() { }
    ngOnInit() { }
}
