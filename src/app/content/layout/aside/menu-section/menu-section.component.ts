import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';

@Component({
	selector: 'm-menu-section',
	templateUrl: './menu-section.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MenuSectionComponent implements OnInit {
	@Input() item: any;

	@HostBinding('class') classes = 'm-menu__item m-menu__item--submenu m-menu__item--submenu-fullheight m-menu__item--open-dropdown m-menu__item--hover';

	constructor() {}

	ngOnInit(): void {}
}
