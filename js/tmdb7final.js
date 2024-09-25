
// Init App
var TMDb7 = new Framework7({
    modalTitle: 'Message',
    // Enable Material theme
    material: true,
    template7Pages: true
});

// Expose Internal DOM library
var ibacor = Dom7;

// Add main view
var mainView = TMDb7.addView('.view-main', {});

var TMDb_key = 'be7eeea7b6d55ad5d6f090d516cf2f2c';
var TMDb_uri = '';
var movieId = '';
var trailersBrowser = [];
var postersBrowser = [];

// Loading trigger
var loading = false;
var lastLoadedIndex = 1;

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
ibacor(document).on('ajaxStart', function(e) {
    TMDb7.showPreloader();
});
ibacor(document).on('ajaxComplete', function(e) {
    TMDb7.hidePreloader();
});

// Callbacks for specific pages when it initialized
TMDb7.onPageInit('home', function(page) {

    loading = false;
    lastLoadedIndex = 1;

    // Request popular movies
    TMDb_uri = 'https://api.themoviedb.org/3/discover/movie?api_key=' + TMDb_key + '&sort_by=popularity.desc&page=';
    movieList(TMDb_uri, false);

    ibacor('#search').on('submit', function() {
        loading = false;
        lastLoadedIndex = 1;

        var query = ibacor('#query').val();
        if (query != '') {
            // Request search movies
            TMDb_uri = 'https://api.themoviedb.org/3/search/movie?query=' + query + '&api_key=' + TMDb_key + '&page=';
            movieList(TMDb_uri, false);
        }
    });

    // Attach 'infinite' event handler
    ibacor('.infinite-scroll').on('infinite', function() {
        // Exit, if loading in progress
        if (loading) return;
        // Set loading trigger
        loading = true;
        // Request more popular movies
        movieList(TMDb_uri, true);
    });

    ibacor('body').on('click', '.detail', function() {
        movieId = ibacor(this).data('movieId');
        trailersBrowser = [];
        postersBrowser = [];
        mainView.router.loadPage('detail.html');
    });

    ibacor('#loop').on('click', function() {
        loading = false;
        lastLoadedIndex = 1;
		
        // Request popular movies
        TMDb_uri = 'https://api.themoviedb.org/3/discover/movie?api_key=' + TMDb_key + '&sort_by=popularity.desc&page=';
        movieList(TMDb_uri, false);
		
		ibacor('#query').val('');
    });

});

// Callbacks for specific pages when it initialized
TMDb7.onPageInit('detail', function(page) {

    ibacor.ajax({
        url: 'https://api.themoviedb.org/3/movie/' + movieId + '?api_key=' + TMDb_key + '&append_to_response=images,casts,trailers',
        crossDomain: true,
        dataType: 'json',
        success: function(b) {
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
            ibacor.each(b.images.backdrops, function(i, a) {
                var ob = {
                    url: 'http://image.tmdb.org/t/p/w500' + a.file_path,
                    caption: 'Backdrops'
                }
                postersBrowser.push(ob);
            });

            ibacor('#movieTitle').html(b.original_title);
            ibacor('#moviDetail').html(html);
        }
    });

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

});

mainView.router.loadPage('home.html');

function movieList(uri, append) {
    ibacor.ajax({
        url: uri + lastLoadedIndex,
        dataType: 'json',
        success: function(data) {
            var html = '';
            ibacor.each(data.results, function(i, a) {
                html += '<div class="card ks-card-header-pic">';
                html += '  <div style="background-image:url(http://image.tmdb.org/t/p/w300' + a.poster_path + ')" data-movieId="' + a.id + '" valign="bottom" class="card-header no-border color-white detail">';
                html += a.title;
                html += '	</div>';
                html += '</div>';
            });
            if (lastLoadedIndex < data.total_pages) {
                loading = false;
                lastLoadedIndex = lastLoadedIndex + 1;
            } else {
                loading = true;
            }
            if (append) {
                ibacor('#movieList').append(html);
            } else {
                ibacor('#movieList').html(html);
            }
        },
        error: function() {
            TMDb7.hidePreloader();
            TMDb7.addNotification({
                message: 'No Internet Connection'
            });
        }
    });
}


