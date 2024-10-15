import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-preview-mom-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PreviewMomPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
