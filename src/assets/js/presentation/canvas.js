

var canvas = document.getElementById('viewport'),
    slides = document.getElementById('slides'),
    ctx = canvas.getContext('2d');
console.log(window.Echo);
  /*  window.io = window.io || require('socket.io-client');
    window.Echo = window.Echo || new Echo({
        broadcaster: 'socket.io',
        host: 'http://localhost:6001',
    }); */   
getSlides(attachmentId);
fitToContainer(canvas);
listenToJoinToPresentationChannel();

function listenToJoinToPresentationChannel() {
    window.Echo.channel('presentAttachmentToParticipants')
        .listen('.PresentAttachmentToParticipantsEvent', (data) => {
            console.log(data);
        }, (e) => {
            console.log(e);
        });

}

function fitToContainer(canvas) {
    // Make it visually fill the positioned parent
    canvas.style.width = '100%';
    canvas.style.height = '80%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function getSlides(id) {
    var targetUrl = apiBaseURL + "/meeting-attachments/" + id;
    // var imageBaseUrl = "http://localhost/mjlsi/Code/BackEnd/public";
    $.ajax({
        url: targetUrl,
        type: 'GET',
        dataType: 'json',

        success: function (data) {
            // console.log(data['presentation_images']);

			/* if (data.presentation_notes) {
				presentationNotes = imagesBaseURL + data.presentation_notes;



            } */
            /*else{
          presentationNotes = null;
        }*/
            // console.log(presentationNotes);

            $.each(data.presentation_images, function (i, imgUrl) {
                var img = new Image();
                if (imgUrl.charAt(0) == '/') {
                    img.src = imagesBaseURL + imgUrl;
                } else {
                    img.src = imagesBaseURL + '/' + imgUrl;
                }
                start(img);

                img.onload = function () {
                    if (i == 0) {
                        scaleToFit(img);
                    }
                    //console.log(this);
                };

            });

			/* $('#refreshEle').css('display','block');
			document.getElementById('reattachmentIdfreshEle').focus(); */



        },
        error: function () {
            // alert("Error");
            console.log("error");
        }

    });
}

/* var imgCount = 2;
var img1 = new Image();
img1.src = "img/slides/1.png";
var img2 = new Image();
img2.src = "img/slides/2.png"; */

/* img1.onload = function () {
    start();
    //console.log(this);
}; */


function start(img) {
    console.log(slides);
    slides.appendChild(img);
    //  slides.appendChild(img2);
    img.onclick = function () { scaleToFit(this); };
    // img2.onclick = function () { scaleToFit(this); };
}


/* var image = new Image();
image.src = "img/slides/1.png";
image.onload = function () {
    scaleToFit(this);
    console.log(this);
} */

function scaleToFit(img) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // get the scale
    var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}




// $('.nav-item').click(function(){
//    var canvas = $('#viewport')[0];
//    canvas.width = canvas.width;//blanks the canvas
//    var c = canvas.getContext("2d");
//     var img = new Image();
//     img.src = 'image2.jpg';
//    img.onload = function(){
//     c.drawImage(img, 0, 0);
//    }
//    return false;
//   });
