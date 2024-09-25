   // 1. Lo primero es crear un objeto de la clase framework7

 
var TMDb7 = new Framework7
({
    // opciones que se establecen sobre el objeto principal de framework7
    modalTitle: 'Message',
    // se usa para utilizar el material de diseno desde f7
    material: true,
    // se usa para renderizar la informacion con templates predifinidos
    //por f7 
    template7Pages: true
});

  //2. se crea una variable para manipular el dom Y los eventos de la "pagina"

var ibacor = Dom7;

  //3. se declaran los elementos "graficos" (vistas, los elementos emergentes, 
  //preloaders y paginacion  

  // 3a. Add main view
var mainView = TMDb7.addView('.view-main', {});


   // 3b. paginacion : estas variable se crean para garantizar el tema de la paginacion 
  // una bandera para indicar que no hay cargar aun de datos
var loading = false;
  // una bandera para indicar cual pagina es la que llevo de los resultados
var lastLoadedIndex = 1;


// cuando ocurre un evento llamado ajaxStart sobre el dom, entonces cargar
// con framework7 un "preloader"

ibacor(document).on('ajaxStart', function(e) {
    TMDb7.showPreloader();

})

// cuando haya cargado completamenta la pagina
// entonces oculte preloader

ibacor(document).on('ajaxComplete', function(e) {
    TMDb7.hidePreloader();
});

   //4. declaracion de variables que se usan para consumir el servicio web 

   var TMDb_key = 'be7eeea7b6d55ad5d6f090d516cf2f2c';
   var TMDb_uri = '';


  /// 5. crear la vista, o la pagina donde se va a cargar la informacion 
  // de primer acceso a la pagina

  TMDb7.onPageInit('home', function(page) {

    /// esta pagina creada con framework 7 contiene la logica de lo que quiero
    // pintar en home.html 

    // primero se consumo elservicio: url(que recurso puntual debo traerme) 
    //apikey 

    TMDb_uri = 'https://api.themoviedb.org/3/discover/movie?api_key=' + TMDb_key + '&sort_by=popularity.desc&page=';


     // creacion de un metodo que reciba una url y un parametro llamado "append"
     // para que realice la busqueda


     movieList(TMDb_uri, false); 


     ibacor('body').on('click', '.detail', function() {
      movieId = ibacor(this).data('movieId');
      trailersBrowser = [];
      postersBrowser = [];
      mainView.router.loadPage('detail.html');




  });




  })   

   // libreria curl 

  function movieList (uri, append)
   {
    ibacor.ajax({

        url: uri + lastLoadedIndex,
        dataType: 'json',
        succes: function(data) {

          ibacor.each(data.results, function(i, a) 
            {
                var html = '';
                html += '<div class="card ks-card-header-pic">';
                html += '  <div style="background-image:url(http://image.tmdb.org/t/p/w300' + a.poster_path + ')" data-movieId="' + a.id + '" valign="bottom" class="card-header no-border color-white detail">';

                html += a.title;

                html += '	</div>';
                html += '</div>';
                

            });

        },

        error: function() 
        {
            
            TMDb7.hidePreloader();
            TMDb7.addNotification({
                message: 'No Internet Connection'
            });


        }
            

    })

   }



   TMDb7.onPageInit('detail', function(page) 
   {
    ibacor.ajax({
      url: 'https://api.themoviedb.org/3/movie/' + movieId + '?api_key=' + TMDb_key + '&append_to_response=images,casts,trailers',

      crossDomain: true,
        dataType: 'json',
        success: function(b) 
        {
          var html = '';
          html += '<div class="card ks-card-header-pic">';
          html += '  <div style="background-image:url(http://image.tmdb.org/t/p/w300' + b.poster_path + ')" valign="bottom" class="card-header no-border color-white">';

          html += '	<span class="color-white">' + b.release_date + '</div>';

          html += '  <div class="card-content">';
          html += '  	<div class="card-content-inner">';

          html += '  		<p class="color-gray">IMDb: ' + b.vote_average + '/10 (' + b.vote_count + ' votes)<span style="float:right">Runtime: ' + b.runtime + ' min</span></p>';

          html += '  		<p>' + b.overview + '</p>';
          html += '  	</div>';
          html += '  </div>';
          html += '</div>';

  
          // guardar los elementos del subarray trailers dentro 
          // dentro del arreglo llamado trailersBrowser


          ibacor.each(b.trailers.youtube, function(i, a) {
            var ob = {
                html: '<iframe src="//www.youtube.com/embed/' + a.source + '" frameborder="0" allowfullscreen style="margin-bottom:100px"></iframe>',
                caption: a.name
            }
            trailersBrowser.push(ob);
        });


ibacor.each(b.images.posters, function(i, a) {
                var ob = {
                    url: 'http://image.tmdb.org/t/p/w500' + a.file_path,
                    caption: 'Posters'
                }
                postersBrowser.push(ob);
            });
         




      }
    })


    ibacor('body').on('click', '.trailers-popup', function() {
      if (trailersBrowser.length > 0) {
          var BrowserPopup = TMDb7.photoBrowser({
              photos: trailersBrowser,
              theme: 'dark',
              type: 'popup'
          });
          BrowserPopup.open();
      } else {
          TMDb7.addNotification({
              message: 'Trailers not found.'
          });
      }
  });

  ibacor('body').on('click', '.posters-popup', function() {
    if (postersBrowser.length > 0) {
        var BrowserPopup = TMDb7.photoBrowser({
            photos: postersBrowser,
            theme: 'dark',
            type: 'popup'
        });
        BrowserPopup.open();
    } else {
        TMDb7.addNotification({
            message: 'Posters not found.'
        });
    }
});


   })
  



















