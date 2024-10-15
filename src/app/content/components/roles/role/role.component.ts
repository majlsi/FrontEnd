import { RoleService } from './../../../../core/services/security/roles.service';

import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Role } from '../../../../core/models/role';
import { Module } from '../../../../core/models/module';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { forkJoin, Observable } from 'rxjs';
import { Right } from '../../../../core/models/right';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
   selector: 'm-role',
   templateUrl: './role.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class RoleComponent implements OnInit {
    role = new Role();
    submitted: boolean = false;
    roleId: number;
    edit: boolean = false;
	modulesObs: Observable<Module[]>;
	errors: Array<String>;
    modules: Array<Module> = [];
    selectedAll: boolean = false;
    rightsRequired: string;
    rightsLength: number = 0;
	isArabic: boolean;

    constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router ,
         private roleService: RoleService, private _translationService: TranslationService) {

    }
	ngOnInit() {
		this.getLanguage();
		this.role.rights = [];
		this.getRights();
		this.route.params.subscribe(params => {
				forkJoin([this.modulesObs])
					.subscribe(data => {
                        this.modules = data[0];
                        this.modules.forEach(mod => {
                            this.rightsLength += mod.rights.length;
                        });
						if (params['id']) {
							this.roleId = +params['id']; // (+) converts string 'id' to a number
							this._crudService.get<Role>('roles', this.roleId).subscribe(
								res => {
                                    this.role = res;
                                    if (this.role.rights.length !== 0) {
                                        this.rightsRequired = 'x';
                                    }
                                    if (this.rightsLength === this.role.rights.length) {
                                        this.selectedAll = true;
                                    }
								},
								error => {
									// console.log('error');
								});
						}
					},
						error => {
							// console.log('error');
						});
        });
	}

	getRights() {
		this.modulesObs = this.roleService.moduleRights<Module>('userAccess/roles/modules-rights');
	}

	isChecked(rightId) {
		const index = this.role.rights.findIndex(function (value: any) { return value.right_id === rightId; });
        if (index === -1) {
			return false;
        } else {
			return true;
		}

    }

	updateRights(right: Right) {
        const index = this.role.rights.findIndex(function (value: any) { return value.right_id === right.id; });
        if (index === -1 && right.is_selected === true) {
            this.role.rights.push({
                'right_id' : right.id
            });
            if (this.rightsLength === this.role.rights.length) {
                this.selectedAll = true;
            }
            this.rightsRequired = 'x';
        } else {
            this.role.rights.splice(index, 1);
            if ( this.role.rights.length === 0) {
                this.rightsRequired = null;
            }
            if (this.selectedAll === true) {
                this.selectedAll = false;
            }
		}
      }



    redirect() {
        this.router.navigate(['/roles']);
    }

    hasError(roleForm: NgForm, field: string, validation: string) {
		if (roleForm && Object.keys(roleForm.form.controls).length > 0 && roleForm.form.controls[field] &&
			roleForm.form.controls[field].errors && validation in roleForm.form.controls[field].errors) {
            if (validation) {
				return (roleForm.form.controls[field].dirty &&
					roleForm.form.controls[field].errors[validation]) || (this.edit && roleForm.form.controls[field].errors[validation]);
            }
			return (roleForm.form.controls[field].dirty &&
				roleForm.form.controls[field].invalid) || (this.edit && roleForm.form.controls[field].invalid);
        }
	}

    save(roleForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (roleForm.valid) { // submit form if valid
            if (this.roleId) { // if edit
                this._crudService.edit<Role>('roles', this.role, this.roleId).subscribe(
                    data => {
						this.router.navigate(['/roles']);
                    },
                    error => {
                        this.submitted = false;
                        if ( error.error_code === 3) {
                            this.errors = error.message;
                        }
                    });
            } else { // if add
                // console.log(this.role);
                this._crudService.add<Role>('roles', this.role).subscribe(
                    data => {
						this.router.navigate(['/roles']);
                    },
                    error => {
                        this.submitted = false;
                         if ( error.error_code === 3) {
                            this.errors = error.message;
                        }
                    });
            }
        } else {
            this.submitted = false;
        }
    }

    selectAll() {
        if (this.selectedAll) {
            this.rightsRequired = 'x';
            this.role.rights = [];
            this.modules.forEach(group => {
                group.rights.forEach(right => {
                    right.is_selected = true;
                    this.role.rights.push({ 'right_id' : right.id});
                });
            });
        } else {
            this.role.rights = [];
            this.rightsRequired = null;
            this.modules.forEach(group => {
                group.rights.forEach(right => {
                    right.is_selected = false;
                });
            });
        }
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
