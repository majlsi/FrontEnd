import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-settings-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
