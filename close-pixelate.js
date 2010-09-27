var ROOT2 = Math.sqrt(2);

// checking for canvas support
var supportsCanvas = !!document.createElement('canvas').getContext;

var isLocalURL = (function() {

    var page = document.location,
        protocol = page.protocol,
        domain = document.domain,
        port = page.port ? page.port : '',
        sop_string = protocol + '//' + port + domain,
        sop_regex = new RegExp('^' + sop_string),
        http_regex = /^http(?:s*)/,
        data_regex = /^data:/,
        closure = function (url) 
        {
            var is_local = (!http_regex.test(url)) || data_regex.test(url),
                is_same_origin = sop_regex.test(url);

            return is_local || is_same_origin;
        };

        return closure;
})();

function getRemoteImageData( img_url, callback ){

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
}

HTMLImageElement.prototype.closePixelate = !supportsCanvas ? function(){} : function( renderOptions ) {

    var img = this,
        local_url = isLocalURL( img.src ),
        onLoadLocal = function (e){
            img.renderClosePixels( renderOptions ) 
        },
        onLoadData = function (obj)
        {
            var new_img = img.cloneNode();
            new_img.src = obj.data;
            img.parentNode.replaceChild(new_img, img);
            new_img.closePixelate( renderOptions );
        },
        onLoadRemote = function (e){ 
            getRemoteImageData( img.src, onLoadData ); 
        },
        onLoad = local_url ? onLoadLocal : onLoadRemote;

  img.onload = onLoad;
  if ( local_url && img.complete ) { 
    img.renderClosePixels( renderOptions ); 
  }

};

HTMLImageElement.prototype.renderClosePixels = function( renderOptions ) {

  var parent = this.parentNode,
      w = this.width,
      h = this.height,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  // render image in canvas
  ctx.drawImage( this, 0, 0);
  // get its data
  var imgData = ctx.getImageData(0, 0, w, h).data,
      getPixelData = function ( x, y ) {
        var pixelIndex = ( x + y * w ) * 4;
            pixelData = {
              red   : imgData[ pixelIndex + 0 ],
              green : imgData[ pixelIndex + 1 ],
              blue  : imgData[ pixelIndex + 2 ],
              alpha : imgData[ pixelIndex + 3 ] / 255
            };
        return pixelData;
      };
  
  // clear the canvas of the image
  ctx.clearRect( 0, 0, w, h);

  for (var i=0, len = renderOptions.length; i < len; i++) {
    var opts = renderOptions[i],
        cols = w / opts.resolution + 1,
        rows = h / opts.resolution + 1,
        // option defaults
        size = opts.size || opts.resolution,
        halfSize = size / 2,
        alpha = opts.alpha || 1,
        offset = opts.offset || 0,
        diamondSize = size / ROOT2;

    for ( var row = 0; row < rows; row++ ) {    
      var y = ( row - 0.5 ) * opts.resolution + offset,
          // normalize y so shapes around edges get color
          pixelY = Math.max( Math.min( y, h-1), 0);
      for ( var col = 0; col < cols; col++ ) {
        var x = ( col - 0.5 ) * opts.resolution + offset,
            // normalize y so shapes around edges get color
            pixelX = Math.max( Math.min( x, w-1), 0),
            pixelData = getPixelData( pixelX, pixelY),
            alpha = pixelData.alpha * alpha;

        ctx.fillStyle = 'rgba(' + pixelData.red + ',' + pixelData.green + ',' + pixelData.blue + ',' + alpha + ')';
        switch ( opts.shape ) {
          case 'circle' :
            ctx.beginPath();
              ctx.arc ( x, y, halfSize, 0, Math.PI*2, true);
              ctx.fill();
            ctx.closePath();
            break;
          case 'diamond' :
            ctx.save();
              ctx.translate( x, y);
              ctx.rotate(Math.PI/4);
              ctx.fillRect(-diamondSize/2, -diamondSize/2, diamondSize, diamondSize );
            ctx.restore();
            break;
          // square
          default :
            ctx.fillRect( x - halfSize, y - halfSize, size, size );
        }
      }
    }
    
  }

  // copy attributes
  canvas.className = this.className;
  canvas.id = this.id;
  // add canvas and remove image
  parent.insertBefore( canvas, this );
  parent.removeChild( this );

};