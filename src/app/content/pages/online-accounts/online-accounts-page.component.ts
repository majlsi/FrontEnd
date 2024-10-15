import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-online-accounts-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class OnlineAccountsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
