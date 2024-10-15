import { UserService } from './../security/users.service';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { RoleService } from '../security/roles.service';


@Injectable()
export class Authorization implements CanActivate, CanActivateChild {
	constructor(private router: Router, private roleService: RoleService, private userService: UserService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		const expectedRole = route.data.right;
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken !== null) {
			return true;

		} else {
			this.router.navigate(['/login']);
			// this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
			return false;
		}

	}

	canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken !== null) {
			// return true;
			// return this.userService.getCurrentUser().pipe(map(res => {
			// 	console.log(res);
			// 	return true;
			// }));

			if (childRoute.data.right !== undefined && childRoute.data.right * 1 !== 0) {
				return this.roleService.canAccess(childRoute.data.right).pipe(map(res => {
					if (res.canAccess === 1) {
						return true;
					} else {
						this.router.navigate(['/']);
						return false;
					}
				}));
			} else {
				return true;
			}

		} else {
			this.router.navigate(['/login']);
			// this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
			return false;
		}
	}
}
