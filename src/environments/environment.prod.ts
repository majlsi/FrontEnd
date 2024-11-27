// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
	production: true,
	pageSize: 10,
	toastTimeout: 10000,
	presentationUrl: '../reveal/master.html',


	apiBaseURL: 'https://ruh-mjls-02.swcc.gov.sa/app/BackEnd/public/api/v1/',
	imagesBaseURL: 'https://ruh-mjls-02.swcc.gov.sa/app/BackEnd/public/',
	redisListenURL: 'https://ruh-mjls-02.swcc.gov.sa/ws',
	// redisListenURL: 'https://ruh-mjls-02.swcc.gov.sa:6001',
	signatureFrontUrl: 'https://ruh-mjls-02.swcc.gov.sa/ds/document',
	googleMapKey: 'AIzaSyDs_00oRVkEFxaGN0Y--Nu36ga1z-z6xUg',

	themeName: 'swcc',
	themeTitleEn: 'swcc',
	themeTitleAr: 'المؤسسة السعودية للمياه',
	storageQuota: {
		min: 1,
		max: 1024
	},
	footerOrgName: 'SWCC',
	companyName: 'swcc',
};

