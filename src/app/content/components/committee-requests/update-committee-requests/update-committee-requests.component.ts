import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-update-committee-requests',
  templateUrl: './update-committee-requests.component.html',
  styleUrls: []
})
export class UpdateCommitteeRequestsComponent implements OnInit, AfterViewInit {
  dataSource: Array<any> = [];
  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  paginatorTotal$: Observable<number>;
  dataSourceLength: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filterObject = new FilterObject();

  displayedColumns = ['committee_name', 'committee_head_name', 'actions'];

  pageSize = environment.pageSize;
  isArabic: boolean;

  constructor(
    private _crudService: CrudService,
    private router: Router,
    private _translationService: TranslationService) { }

  ngOnInit(): void {
    this.isArabic = this._translationService.isArabic();
  }

  ngAfterViewInit(): void {
    /* Data load will be triggered in two cases:
    - when a pagination event occurs => this.paginator.page
    - when a sort event occurs => this.sort.sortChange
    **/
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.getList();
        })
      )
      .subscribe();
    this.getList();
  }

  getList() {
    this.loadingSubject.next(true);
    this.filterObject.PageNumber = this.paginator?.pageIndex + 1;
    this.filterObject.SortBy = 'id';
    this.filterObject.SortDirection = this.sort?.direction ?? 'DESC';
    this.dataSourceLength = false;

    this._crudService.getPaginatedList<PagedResult>('requests/update-committee', this.filterObject).
      subscribe(res => {
        this.loadingSubject.next(false);
        this.paginatorTotal$ = res.TotalRecords;
        this.dataSource = res.Results;
        if (this.dataSource.length === 0) {
          this.dataSourceLength = true;
        }
      },
        error => {
          this.loadingSubject.next(false);
        });
  }

  show(id: any) {
    this.router.navigate(['/committee-requests/update-committee-requests', id]);
  }
}
