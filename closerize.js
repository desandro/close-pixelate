var
  canvas,
  ctx,
  w, h,
  img = new Image(),
  imgData,


  renderLowResShapes = function( shape, resolution, radius, offset, alpha ) {
    var cols = w / resolution,
        rows = h / resolution,
        diamondRadius = radius / Math.sqrt(2) ;

    for ( var row = 0; row < rows; row++ ) {
      for ( var col = 0; col < cols; col++ ) {
        var x = ( col + 0.5 ) * resolution + offset,
            y = ( row + 0.5 ) * resolution + offset,
            pixelData = imgData.getPixelData( x, y);

        ctx.fillStyle = 'rgba(' + pixelData.red + ',' + pixelData.green + ',' + pixelData.blue + ',' + alpha + ')';
        switch ( shape ) {
          case 'circle' :
            ctx.beginPath();
              ctx.arc ( x, y, radius, 0, Math.PI*2, true);
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
            ctx.fillRect( x - radius, y - radius, radius * 2, radius * 2 );
        }
      }
    }

  },

  imageLoaded = function(event) {
    w = img.width;
    h = img.height;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage( img, 0, 0);

    imgData = ctx.getImageData(0, 0, w, h);

    console.log( imgData.getPixelData(700, 500) );

    ctx.clearRect( 0, 0, w, h);

    closerize();

  },

  docReady = function() {
    canvas = document.getElementById('canvas');

    // back out if we can't get context, browser does not support canvas
    if ( !canvas.getContext ) { return; }

    ctx = canvas.getContext('2d');

    img.src = imgURL;
    img.onload = imageLoaded;

  }
;

ImageData.prototype.getPixelData = function(x, y) {
  var pixelIndex = ( x + y * this.width ) * 4,
      pixelData = {
        red   : this.data[ pixelIndex + 0 ],
        green : this.data[ pixelIndex + 1 ],
        blue  : this.data[ pixelIndex + 2 ],
        alpha : this.data[ pixelIndex + 3 ] / 255
      };
  return pixelData;
};

window.addEventListener( 'DOMContentLoaded', docReady, false);