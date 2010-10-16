// checking for canvas support
var supportsCanvas = !!document.createElement('canvas').getContext;

if ( supportsCanvas ){
    HTMLImageElement.prototype.closePixelate = function ( options ) { 
        closePixelate( this, options );
    };
}

var hasSameOrigin = (function ( window, document ) {

    var page = document.location,
        protocol = page.protocol,
        domain = document.domain,
        port = page.port ? ':' + page.port : '',
        sop_string = protocol + '//' + domain + port,
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

})( window, document );

var forgeImage = function ( img, callback ) {

  var onImageLoaded = function( event ) {
    callback( event.target );
  };

  if ( !hasSameOrigin( img.src ) ) {
    // remote
    var onDataLoaded = function( obj ) {
      img.addEventListener( 'load', onImageLoaded, false );
      img.src = obj.data;
    };
    getRemoteImageData( img.src, onDataLoaded );
  } else {
    // local
    if ( img.complete ) {
      callback( img )
    } else {

      img.addEventListener( 'load', onImageLoaded, false ); 
    }
  }
  

};

function closePixelate( img, renderOptions ) {

  var callback = function( image ) {
    renderClosePixels( image, renderOptions );
  };

  forgeImage( img, callback );

}

function renderClosePixels( img, renderOptions ) 
{
  var parent = img.parentNode,
    w = img.width,
    h = img.height,
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

  // render image in canvas
  canvas.width = w;
  canvas.height = h;
  canvas.className = img.className;
  canvas.id = img.id;
  ctx.drawImage( img, 0, 0 );

  // perform the Close pixelations
  processData( ctx, renderOptions, w, h );

  // add canvas and remove image
  img.parentNode.replaceChild( canvas, img );
}

function processData( ctx, renderOptions, w, h )
{
  var PI2 = Math.PI*2, 
    PI1_4 = Math.PI/4,
    imgData = ctx.getImageData(0, 0, w, h).data;

  ctx.clearRect( 0, 0, w, h);

  for (var i=0, len = renderOptions.length; i < len; i++) {
    var opts = renderOptions[i],
      res = opts.resolution,
      // option defaults
      size = opts.size || res,
      alpha = opts.alpha || 1,
      offset = opts.offset || 0,
      offsetX = 0, 
      offsetY = 0,
      cols = w / res + 1,
      rows = h / res + 1,
      halfSize = size / 2,
      diamondSize = size / Math.SQRT2,
      halfDiamondSize = diamondSize / 2, 
      isArray = function ( o ){ return Object.prototype.toString.call( o ) === "[object Array]"; },
      isObject = function ( o ){ return Object.prototype.toString.call( o ) === "[object Object]"; };

      if ( isObject( offset ) ){ 
          offsetX = offset.x || 0;
          offsetY = offset.y || 0;
      } else if ( isArray( offset) ){
          offsetX = offset[0] || 0;
          offsetY = offset[1] || 0;
      } else {
          offsetX = offsetY = offset;
      }

    for ( var row = 0; row < rows; row++ ) {
      var y = ( row - 0.5 ) * res + offsetY,
        // normalize y so shapes around edges get color
        pixelY = Math.max( Math.min( y, h-1), 0);

      for ( var col = 0; col < cols; col++ ) {
        var x = ( col - 0.5 ) * res + offsetX,
          // normalize y so shapes around edges get color
          pixelX = Math.max( Math.min( x, w-1), 0),
          pixelIndex = ( pixelX + pixelY * w ) * 4,
          red = imgData[ pixelIndex + 0 ],
          green = imgData[ pixelIndex + 1 ],
          blue = imgData[ pixelIndex + 2 ];

          alpha *= (imgData[ pixelIndex + 3 ] / 255);
          ctx.fillStyle = 'rgba(' + red +','+ green +','+ blue +','+ alpha + ')';

        switch ( opts.shape ) {
          case 'circle' :
            ctx.beginPath();
              ctx.arc ( x, y, halfSize, 0, PI2, true );
              ctx.fill();
            ctx.closePath();
            break;
          case 'diamond' :
            ctx.save();
              ctx.translate( x, y );
              ctx.rotate( PI1_4 );
              ctx.fillRect( -halfDiamondSize, -halfDiamondSize, diamondSize, diamondSize );
            ctx.restore();
            break;
          // square
          default :
            ctx.fillRect( x - halfSize, y - halfSize, size, size );
        } // switch
      } // col
    } // row
  } // options

}
