/*!
 * Close Pixelate v2.0.00 beta
 * http://desandro.com/resources/close-pixelate/
 * 
 * Developed by
 * - David DeSandro  http://desandro.com
 * - John Schulz  http://twitter.com/jfsiii
 * 
 * Licensed under MIT license
 */

/*jshint asi: true, browser: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */

( function( window, undefined ) {

//
'use strict';

// util vars
var TWO_PI = Math.PI * 2
var QUARTER_PI = Math.PI * 0.25

// utility functions
function isArray( obj ) {
  return Object.prototype.toString.call( obj ) === "[object Array]"
}

function isObject( obj ) {
  return Object.prototype.toString.call( obj ) === "[object Object]"
}

var console = window.console

// check for canvas support
var canvas = document.createElement('canvas')
var isCanvasSupported = canvas.getContext && canvas.getContext('2d')

// don't proceed if canvas is no supported
if ( !isCanvasSupported ) {
  return
}


function ClosePixelation( img, options ) {
  this.img = img
  // creat canvas
  var canvas = this.canvas = document.createElement('canvas')
  this.ctx = canvas.getContext('2d')
  // copy attributes from img to canvas
  canvas.className = img.className
  canvas.id = img.id

  this.render( options )

  // replace image with canvas
  img.parentNode.replaceChild( canvas, img )

}

ClosePixelation.prototype.render = function( options ) {
  this.options = options
  // set size
  var w = this.width = this.canvas.width = this.img.width
  var h = this.height = this.canvas.height = this.img.height
  // draw image on canvas
  this.ctx.drawImage( this.img, 0, 0 )
  // get imageData

  try {
    this.imgData = this.ctx.getImageData( 0, 0, w, h ).data
  } catch ( error ) {
    if ( console ) {
      console.error( error )
    }
    return
  }

  this.ctx.clearRect( 0, 0, w, h )

  for ( var i=0, len = options.length; i < len; i++ ) {
    this.renderClosePixels( options[i] )
  }

}

ClosePixelation.prototype.renderClosePixels = function( opts ) {
  var w = this.width
  var h = this.height
  var ctx = this.ctx
  var imgData = this.imgData

  // option defaults
  var res = opts.resolution || 16
  var size = opts.size || res
  var alpha = opts.alpha || 1
  var offset = opts.offset || 0
  var offsetX = 0
  var offsetY = 0
  var cols = w / res + 1
  var rows = h / res + 1
  var halfSize = size / 2
  var diamondSize = size / Math.SQRT2
  var halfDiamondSize = diamondSize / 2

  if ( isObject( offset ) ){ 
    offsetX = offset.x || 0
    offsetY = offset.y || 0
  } else if ( isArray( offset) ){
    offsetX = offset[0] || 0
    offsetY = offset[1] || 0
  } else {
    offsetX = offsetY = offset
  }

  var row, col, x, y, pixelY, pixelX, pixelIndex, red, green, blue, pixelAlpha

  for ( row = 0; row < rows; row++ ) {
    y = ( row - 0.5 ) * res + offsetY
    // normalize y so shapes around edges get color
    pixelY = Math.max( Math.min( y, h-1), 0)

    for ( col = 0; col < cols; col++ ) {
      x = ( col - 0.5 ) * res + offsetX
      // normalize y so shapes around edges get color
      pixelX = Math.max( Math.min( x, w-1), 0)
      pixelIndex = ( pixelX + pixelY * w ) * 4
      red   = imgData[ pixelIndex + 0 ]
      green = imgData[ pixelIndex + 1 ]
      blue  = imgData[ pixelIndex + 2 ]
      pixelAlpha = alpha * ( imgData[ pixelIndex + 3 ] / 255)

      ctx.fillStyle = 'rgba(' + red +','+ green +','+ blue +','+ pixelAlpha + ')'

      switch ( opts.shape ) {
        case 'circle' :
          ctx.beginPath()
            ctx.arc ( x, y, halfSize, 0, TWO_PI, true )
            ctx.fill()
          ctx.closePath()
          break
        case 'diamond' :
          ctx.save()
            ctx.translate( x, y )
            ctx.rotate( QUARTER_PI )
            ctx.fillRect( -halfDiamondSize, -halfDiamondSize, diamondSize, diamondSize )
          ctx.restore()
          break
        default :
          // square
          ctx.fillRect( x - halfSize, y - halfSize, size, size )
      } // switch
    } // col
  } // row

}

// enable img.closePixelate
HTMLImageElement.prototype.closePixelate = function ( options ) {
  return new ClosePixelation( this, options )
}

// put in global namespace
window.ClosePixelation = ClosePixelation

})( window );
