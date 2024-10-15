import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-faq-sections-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class FaqSectionsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
