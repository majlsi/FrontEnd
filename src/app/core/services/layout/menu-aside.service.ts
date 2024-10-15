import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { MenuConfigService } from '../menu-config.service';
import { ClassInitService } from '../class-init.service';
import * as objectPath from 'object-path';
import { RoleService } from '../security/roles.service';


@Injectable()
export class MenuAsideService {
	classes: string;
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	conversationMenu$: BehaviorSubject<any[]> = new BehaviorSubject([]);

	constructor(
		private menuConfigService: MenuConfigService,
		private classInitService: ClassInitService,
		private roleService: RoleService
	) {
		// get menu list
		this.menuConfigService.onMenuUpdated$.subscribe(model => {
			setTimeout(() =>
			 //this.menuList$.next(objectPath.get(model.config, 'aside.items'))  //for static menu

				// dynamic menu
				this.roleService.getRoleSideMenu().subscribe(e => {
					 const menuItems = objectPath.get(e, '');
					 if (menuItems) {
						 const filteredMenuItems = menuItems
							 .filter(item => Array.isArray(item.submenu) && item.submenu.length > 0);
						 this.menuList$.next(filteredMenuItems);
					 }
				})
			);
			// setTimeout(() =>
			// 	//get conversation right
			// 	this.roleService.getConversationRight().subscribe(e => {
			// 		this.conversationMenu$.next(objectPath.get(e, ''));
			// 	})
			// );
		});
	}
}
