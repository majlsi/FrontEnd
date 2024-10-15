import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-organizations-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
