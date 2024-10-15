import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-history-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class HistoriesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
