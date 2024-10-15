import { Observable, Subject, from, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { TokenStorage } from './token-storage.service';
import { TokenSessionService } from './token-session.service';
import { UtilsService } from '../services/utils.service';
import { AccessData } from './access-data';
import { Credential } from './credential';
import { environment } from '../../../environments/environment';
import { ResetPassword } from '../models/reset-password';

@Injectable()
export class AuthenticationService {
	API_URL = 'api';
	API_ENDPOINT_LOGIN = '/login';
	API_ENDPOINT_REFRESH = '/refresh';
	API_ENDPOINT_REGISTER = '/register';

	public onCredentialUpdated$: Subject<AccessData>;

	constructor(
		private http: HttpClient,
		private tokenStorage: TokenStorage,
		private tokenSessionService: TokenSessionService,
		private util: UtilsService
	) {
		this.onCredentialUpdated$ = new Subject();
	}

	/**
	 * Check, if user already authorized.
	 * @description Should return Observable with true or false values
	 * @returns {Observable<boolean>}
	 * @memberOf AuthService
	 */
	public isAuthorized(): Observable<boolean> {
		return this.tokenStorage.getAccessToken().pipe(map(token => !!token));
	}

	/**
	 * Get access token
	 * @description Should return access token in Observable from e.g. localStorage
	 * @returns {Observable<string>}
	 */
	public getAccessToken(): Observable<string> {
		return this.tokenStorage.getAccessToken();
	}

	/**
	 * Get user roles
	 * @returns {Observable<any>}
	 */
	public getUserRoles(): Observable<any> {
		return this.tokenStorage.getUserRoles();
	}

	/**
	 * Function, that should perform refresh token verifyTokenRequest
	 * @description Should be successfully completed so interceptor
	 * can execute pending requests or retry original one
	 * @returns {Observable<any>}
	 */
	public refreshToken(): Observable<AccessData> {
		return this.tokenStorage.getRefreshToken().pipe(
			switchMap((refreshToken: string) => {
				return this.http.get<AccessData>(this.API_URL + this.API_ENDPOINT_REFRESH + '?' + this.util.urlParam(refreshToken));
			}),
			tap(this.saveAccessData.bind(this)),
			catchError(err => {
				this.logout();
				return throwError(err);
			})
		);
	}

	/**
	 * Function, checks response of failed request to determine,
	 * whether token be refreshed or not.
	 * @description Essentialy checks status
	 * @param {Response} response
	 * @returns {boolean}
	 */
	public refreshShouldHappen(response: HttpErrorResponse): boolean {
		return response.status === 401;
	}

	/**
	 * Verify that outgoing request is refresh-token,
	 * so interceptor won't intercept this request
	 * @param {string} url
	 * @returns {boolean}
	 */
	public verifyTokenRequest(url: string): boolean {
		return url.endsWith(this.API_ENDPOINT_REFRESH);
	}

	/**
	 * Submit login request
	 * @param {Credential} credential
	 * @returns {Observable<any>}
	 */
	public login(credential: Credential): Observable<any> {
		return this.http.post<AccessData>(environment.apiBaseURL + 'authenticate', credential).pipe(
			map((result: any) => {
				if (result instanceof Array) {
					return result.pop();
				}
				return result;
			}),
			tap((res: any) => {
				if (res.hasTwoFactorAuth === 0) {
					this.saveAccessData(res);
				}
			}),
			catchError(err => {
				return throwError(err);
			})
		);
	}



	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return from(result);
		};
	}

	/**
	 * Logout
	 */
	public logout(refresh?: boolean): void {
		this.tokenStorage.clear();
		if (refresh) {
			location.reload();
		}
	}

	/**
	 * Save access data in the storage
	 * @private
	 * @param {AccessData} data
	 */
	private saveAccessData(accessData: AccessData) {
		if (typeof accessData !== 'undefined') {
			this.tokenStorage
				.setAccessToken(accessData.token)
				.setRefreshToken(accessData.refreshToken)
				.setUserRoles(accessData.roles);
			this.onCredentialUpdated$.next(accessData);
		}
	}

	/**
	 * Submit registration request
	 * @param {Credential} credential
	 * @returns {Observable<any>}
	 */
	public register(credential: Credential): Observable<any> {
		credential.username = credential.email;
		// dummy token creation
		return this.http.post(environment.apiBaseURL + 'authenticate/register', credential)
			.pipe(catchError(err => {
				return throwError(err);
			})
			);
	}

	/**
	 * Submit forgot password request
	 * @param {Credential} credential
	 * @returns {Observable<any>}
	 */
	public requestPassword(username: string): Observable<any> {
		return this.http.post(environment.apiBaseURL + 'authenticate/forget-password', username).pipe(
			catchError(err => {
				return throwError(err);
			})
		);
	}

	public resetPassword(resetPassword: ResetPassword): Observable<any> {
		return this.http.post(environment.apiBaseURL + 'authenticate/reset-password', resetPassword).pipe(
			catchError(err => {
				return throwError(err);
			})
		);
	}

	public validateVerificationCode(code: any): Observable<any> {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.tokenSessionService.getAccessToken(),

			})
		};
		return this.http.post(environment.apiBaseURL + 'authenticate/validate-verification-code', code, httpOptions)
			.pipe(
				tap((res: any) => {
					this.saveAccessData(this.tokenSessionService.getLoginResponseData());
				}),
				catchError(err => {
					return throwError(err);
				})
			);
	}

	public sendCodeNotification(data: any): Observable<any> {
		const httpOptions = {headers: new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.tokenSessionService.getAccessToken()})};
		return this.http.post(environment.apiBaseURL + 'authenticate/send-code', data, httpOptions)
			.pipe(
				catchError(err => {
					return throwError(err);
				})
			);
	}

	    
    resendCode(data: any): Observable<any> {
		const httpOptions = {headers: new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.tokenSessionService.getAccessToken()})};
			return this.http.post(environment.apiBaseURL + 'authenticate/send-verification-code', data, httpOptions)
			.pipe(
				catchError(err => {
					return throwError(err);
				})
			);
	}

}
