
//Dependencies
var http = require('http')
  , express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , app = express()
  , server = http.createServer(app).listen(process.env['app_port'] || 3000)
  , io = require('socket.io').listen(server)
  , items = require('./items')




//Use Nib on CSS

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

//Views and Middleware
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))



//Variable for if there is a current drawer, default to false.
var values = {
  'drawer': false,
  'item': null
}

// If there is no current drawer the app goes to the drawing page I
// If there is a drawer then user is sent to the view page
app.get('/', function (req, res) {
  if(!values.drawer){    
    res.render('drawer',
    { title : 'Drawer',
      script : '/scripts/draw.js'
    }
    )
  }
  else{
    res.render('viewer',
    { title : 'viewer',
      script : '/scripts/view.js'
    }
    )
  }
})

app.get('/viewer', function (req, res){
  res.render('viewer',
    { title : 'viewer',
      script : '/scripts/view.js'
    }
    )
})

  //Socket traffic. Everything is put in the connection function.

io.sockets.on('connection', function(socket){
    
    
    

    //Establish New Connection
    socket.emit('user_connect')

    /*
     * When a user connects the socket gets labeled for whether it is a drawer or a viewer
     * and alerts the console a user has connected as such
     */
    socket.on('new_drawer', function(){
        values.drawer = true
        socket.set('task', 'drawer')
        console.log('New Drawer!')
        values.item = items.list[Math.floor(Math.random()*items.list.length)]
        socket.emit('newItem', { 'item': values.item })        
      })

    
    socket.on('set_viewer', function(){
         socket.set('task', 'viewer')
         console.log('New Viewer') 
    })



   //These lines take in the data emitted from the draw page and broadcast them out to all viewers
    socket.on('down', function(data){
      socket.broadcast.emit('mouseDown', data)
    })

    socket.on('move', function(data){
      socket.broadcast.emit('mouseMove', data);
    })

    

    //When a user disconnects
    socket.on('disconnect', function(){
        socket.get('task', function(err, task){
            if (err){
                console.log('Error deciding users task');
            }
            else if (task == 'drawer'){
                values.drawer = false; //When drawer disconnects users.drawer is reset to false to allow a new drawer. Even though the value changes, the routing doesn't reset.
                console.log('Drawer Disconnected');
            }
            else if (task == 'viewer'){
                console.log('Viewer Disconnected');
            }
        })
        
    })

    //Clears the canvas for all viewers
    socket.on('clear', function(){
      socket.broadcast.emit('clearCanvas')
    })

    //Checks a viewers guess. If correct declares them winner and makes them new drawer
    socket.on('guess', function(data){      
      if (values.item == data.guess){
        socket.emit('correct')
      }
    })

    socket.on('switch', function(){
      socket.broadcast.emit('clearDrawer')
      socket.broadcast.emit('clearCanvas')
    })
})



