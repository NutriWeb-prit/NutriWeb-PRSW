 const image = document.getElementById('placeholder');
 const imageUpload = document.getElementById('imageUpload');


 imageUpload.addEventListener('change', function(event) {
     const file = event.target.files[0];

     if (file) {
         const reader = new FileReader();

         reader.onload = function(e) {
             image.src = e.target.result;
         }

         reader.readAsDataURL(file);
     }
 });