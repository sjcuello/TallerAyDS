module.exports = function(server){
	var io = require("socket.io")(server);
	var passportSocketIo = require("passport.socketio");
	var connections = 0;
	var roomno = 1;

	io.on('connection', function(socket){ 
		connections++;
		console.log('connected', connections);
		io.sockets.emit('broadcast',{description: connections + ' jugadores conectados!'}); 	
	  	
		console.log(socket.request.user);
		//console.log(socket.request.user.logged_in);

	  	if (socket.request.user && socket.request.user.logged_in) {
	      console.log(socket.request.user);
	    }

	  	if(io.nsps['/'].adapter.rooms["room-"+roomno])
	  	socket.join("room-" + roomno);
	  	io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
		
		socket.on('disconnect', function () {
			connections--;
			console.log('connected', connections);
			io.sockets.emit('broadcast',{description: connections + ' jugadores conectados!'});
		});
	});
}