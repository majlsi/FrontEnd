import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError as observableThrowError, throwError } from 'rxjs';
import { AuthenticationService } from '../../auth/authentication.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { SplashScreenService } from '../splash-screen.service';

@Injectable()
export class RequestService {
	constructor(
		private http: HttpClient, private _router: Router,
		private authService: AuthenticationService,
		private splashScreenService: SplashScreenService) {
	}

	SendRequest(method: string, url: string, data: any, responseType): Observable<any> {

		if (!responseType) {
			responseType = 'json';
		}
		return this.http.request(method, url,
			{
				headers: this.jwt(),
				responseType: responseType,
				body: data
			}).pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
	}

	SendRequest2( url: string, data: any, header: any): Observable<any> {
		const header1 = {
			'Content-Type': 'application/json'
		};


		return this.http.post( url, data,
			{
				headers: header
			});
	}

	private jwt() {
		// create authorization header with jwt token
		const token = localStorage.getItem('accessToken');
		if (token) {
			const headers = new HttpHeaders({
				// 'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
				// 'cashe': 'false',
				// 'foobar': '' + new Date().getTime() + '',
			});
			return headers;
		}
	}

	Upload(url: string, data: FormData, responseType: string): Observable<any> {
		return this.http.post(url, data, {
			headers:  this.jwt()  ,

		}).pipe(catchError((error, caught) => {
			// intercept the respons error and displace it to the console
			return this.handleError(error);
		}));

	}

	private handleError(res: HttpErrorResponse) {
		if (res.status === 500) {
			return throwError(res.error);
		} else if (res.status === 400) {
			if (res.error.organization_data_not_complete) {
				this._router.navigate(['/welcome']);
				return throwError(res.error);
			} else {
				return throwError(res.error);
			}

		} else if (res.status === 401) {
			if (res.error.redirectUrl) {
				this._router.navigate([res.error.redirectUrl]);
			} else {
				this.authService.logout(true);
			}
			return throwError(res.error);
		} else if (res.status === 409) {
			return throwError(res.error);
		}  else if (res.status === 404) {
			return throwError(res.error);
		}
	}

	DownloadFile(url: string) {
		const httpOptions = {
			responseType: 'blob' as 'json',
			headers: this.jwt(),
		};
		return this.http.post(url, null, httpOptions);
	}

}
