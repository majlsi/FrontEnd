// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
	production: true,
	pageSize: 10,
	toastTimeout: 10000,
	presentationUrl: '../reveal/master.html',

	apiBaseURL: "http://134.122.87.251/mjlsi/wp-mjlsi/app/BackEnd/public/api/v1/",
	imagesBaseURL: "http://134.122.87.251/mjlsi/wp-mjlsi/app/BackEnd/public/",
	redisListenURL: 'http://134.122.87.251:6001',
	signatureFrontUrl: 'http://134.122.87.251/ds-test/document',
	googleMapKey: 'AIzaSyDs_00oRVkEFxaGN0Y--Nu36ga1z-z6xUg',

	themeName: 'gaft',
	themeTitleEn: 'Saudi General Authority of Foreign Trade',
	themeTitleAr: 'الهيئة العامة للتجارةالخارجية',
	storageQuota:{
		min:1,
		max:1024
	},
	footerOrgName: 'Mjlsi System',
	companyName: 'mjlsi',
};

