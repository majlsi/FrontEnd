import { UserService } from './../security/users.service';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from '../organization/organization.service';


@Injectable()
export class OrganizationCompletedData implements CanActivate, CanActivateChild {
    constructor(private router: Router, private organizationService: OrganizationService,
        private userService: UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken !== null) {
            return this.organizationService.checkOrganizationCompletedData().pipe(map(res => {
                if (res === false) {
                    return true;
                } else {
                    this.router.navigate(['/']);
                    return false;
                }
            }));
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return true;
    }
}
