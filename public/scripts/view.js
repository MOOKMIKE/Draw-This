/*
	Socket connections and variables.
*/
var socket = io.connect('http://localhost:3000'); 
var canvas = document.getElementById('viewpad');
var context = canvas.getContext('2d');

socket.on('user_connect', function(){
  socket.emit('set_viewer');  
});  

/*
	Game events
*/

socket.on('mouseDown', function(data){
	context.beginPath();
	context.moveTo(data.x, data.y);
	
});

socket.on('mouseMove', function(data){
	context.lineTo(data.x, data.y);
	context.stroke();
		
});

socket.on('clearCanvas', function(){
	canvas.width = canvas.width;
});

socket.on('correct', function(){
	$('#myModal').reveal();
});

/*
	Tools
*/

$('#guessButton').click(function(){
	word = $('#guessBox').val().toLowerCase();	
	socket.emit('guess', { 'guess': word });

});

