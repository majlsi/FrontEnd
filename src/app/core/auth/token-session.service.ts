import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class TokenSessionService {
    public responseData;

    setLoginResponseData(data: any) {
        this.responseData = data;
    }

    getAccessToken() {
        if (this.responseData) {
            return this.responseData.token;
        }
        return null;
    }

    getLoginResponseData() {
        return this.responseData;
    }
}
