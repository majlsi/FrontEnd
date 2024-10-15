 // $(function () {

  var url = new URL(window.location.href);
  var search_params = new URLSearchParams(url.search);
 
 
  // this will be true
  if (search_params.has('id')) {
     var attachmentId = search_params.get('id');
  }
  if (search_params.has('type')) {
     var userType = search_params.get('type');
  }

  var apiBaseURL = 'BackEnd/public/api/v1';
  var imagesBaseURL = 'BackEnd/public';


//});