import { environment } from '../../../environments/environment';
import * as $ from 'jquery';

export const JoditEditor: any = {
    activeButtonsInReadOnly: ['fullsize', 'about', 'dots'],
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    uploader: {
        insertImageAsBase64URI: false,
        imagesExtensions: ['jpg', 'png', 'jpeg'],
        url: environment.apiBaseURL + 'upload',
        filesVariableName: function (e) {
            return 'file';
        },
        prepareData: function (data) {
            data.append('path', '/moms');
            return data;
        },
        isSuccess: function (resp) {
            return resp;
        },
        process: function (resp) {
            return {
                path: resp.url,
                error: '',
                message: '',
            };
        },
        defaultHandlerSuccess: function (data) {
            const j = this;
            const tagName = 'img';
            const elm = j.createInside.element(tagName);
            elm.setAttribute('src', environment.imagesBaseURL + data.path);
            j.s.insertImage(elm as HTMLImageElement, null, j.o.imageDefaultWidth);
        },
        error: function (e) {
            $('#error').click();
        }
    },
    buttons: ['bold', 'strikethrough', 'underline', 'italic', 'eraser', '|', 'superscript', 'subscript', '|', 'ul', 'ol', '|',
        'outdent', 'indent', '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'image', 'table', 'link', '|', 'align',
        'undo', 'redo', '\n', 'selectall', 'cut', 'copy', 'paste', 'copyformat', '|', 'hr', 'symbol', 'fullsize', 'preview',
        'find', 'about'
    ],
    buttonsMD: ['bold', 'image', '|', 'brush', 'paragraph', 'eraser', '\n', 'align', 'undo', 'redo', '|', 'dots'],
    buttonsXS: ['bold', 'image', '|', 'brush', 'paragraph', '|', 'align', '|', 'undo', 'redo', '|', 'eraser',
        'dots'
    ],
};
