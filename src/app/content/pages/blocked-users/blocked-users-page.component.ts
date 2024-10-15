import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-blocked-users-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class BolckedUsersPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
