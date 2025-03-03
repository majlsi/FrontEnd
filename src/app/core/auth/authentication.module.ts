import { NgModule } from '@angular/core';

import { TokenStorage } from './token-storage.service';
import { AuthenticationService } from './authentication.service';

export function factory(authenticationService: AuthenticationService) {
	return authenticationService;
}

@NgModule({
	// imports: [AuthModule],
	imports: [],
	providers: [
		TokenStorage,
		AuthenticationService,
		// { provide: PROTECTED_FALLBACK_PAGE_URI, useValue: '/' },
		// { provide: PUBLIC_FALLBACK_PAGE_URI, useValue: '/login' },
		// {
		// 	provide: AUTH_SERVICE,
		// 	deps: [AuthenticationService],
		// 	useFactory: factory
		// }
	]
})
export class AuthenticationModule {}
