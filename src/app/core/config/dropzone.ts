import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { environment } from '../../../environments/environment';

export const dropzone: DropzoneConfigInterface = {
	url: environment.apiBaseURL + 'upload-file',
	maxFilesize: 2000,
	acceptedFiles: 'image/*,application/*,video/*',
	autoProcessQueue: false,
	headers: {'Content-Type': 'multipart/form-data'},
};
