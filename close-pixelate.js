var ROOT2 = Math.sqrt(2);

// checking for canvas support
var supportsCanvas = !!document.createElement('canvas').getContext;

HTMLImageElement.prototype.closePixelate = !supportsCanvas ? function(){} : function( renderOptions ) {
  // attach render options to image
  this.renderOptions = renderOptions;

  // check if image is already loaded in cache
  if ( this.complete ) {
    this.renderClosePixels();
  } else {
    this.onload = this.renderClosePixels;
  }

};

HTMLImageElement.prototype.renderClosePixels = function() {

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
  var imgData = ctx.getImageData(0, 0, w, h);
  // clear the canvas of the image
  ctx.clearRect( 0, 0, w, h);


  for (var i=0, len = this.renderOptions.length; i < len; i++) {
    var opts = this.renderOptions[i],
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
            pixelData = imgData.getPixelData( pixelX, pixelY),
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


// Opera and Firefox don't have an ImageData singleton in window. Use Object instead
var ImageDataObject = (!!window.ImageData && typeof(window.ImageData) === 'object') ? ImageData : Object;
// extend ImageData with getPixelData method that returns RGBa value from ImageData array/object
ImageDataObject.prototype.getPixelData = function(x, y) {
  var pixelIndex = ( x + y * this.width ) * 4,
      pixelData = {
        red   : this.data[ pixelIndex + 0 ],
        green : this.data[ pixelIndex + 1 ],
        blue  : this.data[ pixelIndex + 2 ],
        alpha : this.data[ pixelIndex + 3 ] / 255
      };
  return pixelData;
};