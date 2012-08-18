/*
 Socket events 
*/

var socket = io.connect("http://localhost:3000");
socket.on('user_connect', function(){
  socket.emit('new_drawer');
}); 
  
socket.on('clearDrawer', function(){
  window.location = '/viewer';
});

socket.on('newItem', function(data){
  $('#item').html(data.item);
  $('#modalItem').html(data.item);
  $('#myModal').reveal();
  countdown();  
});   

/*
  Non Canvas Page Elements
*/

function countdown(){ //This functions controls the countdown timer the drawer has
  secondsLeft = 30;
  timer();
  function timer(){
    setTimeout(function(){
      secondsLeft--;
      tick();
    }, 1000);
  }

  function tick(){
    if (secondsLeft > 0) {
      $('#time').html(secondsLeft);
      timer();
    }
    else{
      $('#time').html(0);
      $('#timesUp').animate({
        opacity: 1,
      }, 1000);
      $('#drawpad').css('background-color', '#000');
      setTimeout(window.location = '/viewer', 3000);
    }
  } 
  
}


$('#clear').click(function clearCanvas(){ //This clears the canvas element and sends a "clear" message to the server
   canvas.width = canvas.width;
   socket.emit('clear');
});




/* Sketch Pad Logic:
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 */	
	
	
  var canvas, context, tool;

  function init () {
    // Find the canvas element.
    canvas = document.getElementById('drawpad');
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }

    // Pencil tool instance.
    tool = new tool_pencil();

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  
  // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        socket.emit('down', { 'x': ev._x, 'y': ev._y} );
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
        socket.emit('move', { 'x': ev._x, 'y': ev._y} );
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
      }
    };
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX-20;
      ev._y = ev.layerY-70;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  init();

