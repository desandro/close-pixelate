var ROOT2 = Math.sqrt(2);

// extend ImageData with getPixelData method that returns RGBa value from ImageData array/object
var ImageDataObject = (!!window.ImageData && typeof(window.ImageData) === 'object') ? ImageData : Object;
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


// checking for canvas support
var supportsCanvas = !!document.createElement('canvas').getContext;

HTMLImageElement.prototype.closeWithCanvas = !supportsCanvas ? function(){} : function( renderOptions ) {
  this.renderOptions = renderOptions;
  
  this.onload = this.renderCloseWithCanvas;
  
  // console.log ( this.width )
};

HTMLImageElement.prototype.renderCloseWithCanvas = function(event) {
  var image = event.target,
      parent = image.parentNode,
      w = image.width,
      h = image.height,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');



  canvas.width = w;
  canvas.height = h;

  ctx.drawImage( image, 0, 0);
  var imgData = ctx.getImageData(0, 0, w, h);
  ctx.clearRect( 0, 0, w, h);


  for (var i=0, len = this.renderOptions.length; i < len; i++) {
    var opts = this.renderOptions[i],
        cols = w / opts.resolution,
        rows = h / opts.resolution,
        diamondRadius = opts.radius / ROOT2;
    
    for ( var row = 0; row < rows; row++ ) {
      for ( var col = 0; col < cols; col++ ) {
        var x = ( col + 0.5 ) * opts.resolution + opts.offset,
            y = ( row + 0.5 ) * opts.resolution + opts.offset,
            pixelData = imgData.getPixelData( x, y),
            alpha = pixelData.alpha * opts.alpha;

        ctx.fillStyle = 'rgba(' + pixelData.red + ',' + pixelData.green + ',' + pixelData.blue + ',' + alpha + ')';
        switch ( opts.shape ) {
          case 'circle' :
            ctx.beginPath();
              ctx.arc ( x, y, opts.radius, 0, Math.PI*2, true);
              ctx.fill();
            ctx.closePath();
            break;
          case 'diamond' :
            ctx.save();
              ctx.translate( x, y);
              ctx.rotate(Math.PI/4);
              ctx.fillRect(-diamondRadius, -diamondRadius, diamondRadius*2, diamondRadius*2 );
            ctx.restore();
            break;
          // squares
          default :
            ctx.fillRect( x - opts.radius, y - opts.radius, opts.radius * 2, opts.radius * 2 );
        }
      }
    }
    
  }
  
  // copy attributes
  canvas.className = image.className;
  canvas.id = image.id;
  // add canvas and remove image
  parent.insertBefore( canvas, image );
  parent.removeChild( image );

};