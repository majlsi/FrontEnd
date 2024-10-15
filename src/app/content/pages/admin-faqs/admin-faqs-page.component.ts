import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-admin-faqs-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class AdminFaqsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
