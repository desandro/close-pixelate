var imgForgery = {};

imgForgery.hasSameOrigin = (function() {

  var page = document.location,
      protocol = page.protocol,
      domain = document.domain,
      port = page.port ? ':' + page.port : '',
      sop_string = protocol + '//' + domain + port,
      sop_regex = new RegExp('^' + sop_string),
      http_regex = /^http(?:s*)/,
      data_regex = /^data:/,
      closure = function ( url )
      {
          var is_local = (!http_regex.test(url)) || data_regex.test(url),
              is_same_origin = sop_regex.test(url);

          return is_local || is_same_origin;
      };

  return closure;
  
})();

imgForgery.getRemoteImageData = function ( img_url, callback )
{
    var page_url = document.location.href,
        secure_root = "https://img-to-json.appspot.com/",
        insecure_root = "http://img-to-json.maxnov.com/",
        secure_regex = /^https:/,
        is_secure = secure_regex.test(img_url) || secure_regex.test(page_url),
        service_root = is_secure ? secure_root : insecure_root,
        cb_stack_name = "cp_remote_image_callbacks",
        cb_stack = cb_stack_name in window ? window[cb_stack_name] : window[cb_stack_name] = [],
        cb_name = cb_stack_name +'['+ cb_stack.length +']',
        service_url = service_root + "?url=" + escape(img_url) + "&callback=" + cb_name,
        script = document.createElement('script');

    cb_stack.push( callback );
    script.src = service_url;
    document.body.appendChild(script);
};

imgForgery.forgeImage = function( img, callback ) {
  
  var onImageLoaded = function( event ) {
    callback( event.target );
  };

  if ( !imgForgery.hasSameOrigin( img.src ) ) {
    // remote
    var onDataLoaded = function( obj ) {
      var proxyImage = new Image();
      proxyImage.addEventListener( 'load', onImageLoaded, false );
      proxyImage.src = obj.data;
    };
    imgForgery.getRemoteImageData( img.src, onDataLoaded );
  } else {
    // local
    if ( img.complete ) {
      callback( img )
    } else {

      img.addEventListener( 'load', onImageLoaded, false ); 
    }
  }
  
};