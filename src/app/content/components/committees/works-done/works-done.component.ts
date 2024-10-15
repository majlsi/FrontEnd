import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { TranslateService } from "@ngx-translate/core";
import { EnvironmentVariableService } from "../../../../core/services/enviroment-variable/enviroment-variable.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Committee } from "../../../../core/models/committee";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Component({
	selector: "m-works-done",
	templateUrl: "./works-done.component.html",
	styleUrls: ["./works-done.component.scss"],
})
export class WorksDoneComponent implements OnInit, AfterViewInit {
	isArabic: boolean;
	displayedColumns = ["work_done", 'work_done_date', "actions"];
	dataSource: any;
	committeeId: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	constructor(private _crudService: CrudService, private _translationService: TranslationService, private translate: TranslateService, private _environmentVariableService: EnvironmentVariableService, private _modalService: NgbModal, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
		this.route.params.subscribe((params) => {
			if (params["id"]) {
				this.committeeId = +params["id"]; // (+) converts string 'id' to a number
			}
		});
	}
	ngAfterViewInit(): void {
		this.getWorksDone();
	}
	ngOnInit(): void {
		this.getLanguage();
	}

	getWorksDone() {
		this._crudService.get("admin/works-done", this.committeeId).subscribe(
			(res) => {
				this.dataSource = res;
			},
			(error) => {}
		);
	}

	addWork(data) {
		this.dataSource.push(data);
		this.getWorksDone();
	}



	editWork(data) {
		this.getWorksDone();
	}

	delete(work)
	{
		this._crudService.delete("admin/works-done", work.id).subscribe(
			(res) => {
				this.getWorksDone();
			},
			(error) => {}
		);
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
