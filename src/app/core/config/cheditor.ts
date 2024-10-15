
export const Cheditor: any = {
    toolbar: {
        items: ['heading', '|', 'fontSize', 'fontFamily', '|', 'bold', 'italic', 'underline',
                'strikethrough', 'fontColor', 'fontBackgroundColor', '|',
                'alignment', '|', 'numberedList',
                'bulletedList', '|', 'indent', 'outdent', '|', 'link', 'blockQuote',
                'imageUpload', 'insertTable', '|', 'undo', 'redo'],
    },
    image: {
        styles: ['alignLeft', 'alignCenter', 'alignRight'],
        toolbar: ['imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
                  '|', 'imageResize', '|', 'imageTextAlternative'],
        resizeOptions: [
            { name: 'imageResize:original', label: 'Original', value: null},
            { name: 'imageResize:50', label: '50%', value: '50'},
            { name: 'imageResize:75', label: '75%', value: '75'}
        ]

    },
    table: {
        contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells']
    },
    //extraPlugins: [ImageResize]
};
