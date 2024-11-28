// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
	production: false,
	pageSize: 10,
	toastTimeout: 10000,
	presentationUrl: '../reveal/master.html',

	apiBaseURL: "http://swcc-test.mjlsi.com/app-test/BackEnd/public/api/v1/",
	imagesBaseURL: "http://swcc-test.mjlsi.com/app-test/BackEnd/public/",
	redisListenURL: 'http://swcc-test.mjlsi.com:6001',
	signatureFrontUrl: 'http://swcc-test.mjlsi.com/ds-test/document',
	googleMapKey: 'AIzaSyDs_00oRVkEFxaGN0Y--Nu36ga1z-z6xUg',

	themeName: 'swcc',
	themeTitleEn: 'swcc',
	themeTitleAr: 'الهيئة السعودية للمياه',
	storageQuota:{
		min:1,
		max:1024
	},
	footerOrgName: 'SWCC',
	companyName: 'swcc',
};

