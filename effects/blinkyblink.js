var net = require('net');
var async = require('async');
var assert = require('assert');

var IP = '10.11.0.101';
var PORT = 80;


var MAX_PIXEL = 384;  
var PIXELPIN = 0;
var MAXPORT = 2;
var TIMEOUT = 50;
var STROBE = 5;

var index = 0;
var color = 0;
var count = 0;
var CMD_SETCOLOR = new Buffer([0x07,0x00,0x15,PIXELPIN,0x00,0x00,0x00]);
var CMD_CLEARPIXEL = new Buffer([0x04,0x00,0x12]);
var led_on = false;


var socketopen = false;
var client = new net.Socket();
  
function connect(callback){
	if(!socketopen){
		client.connect(PORT, IP, function(err){
			socketopen = true;
			callback();
		});
	}else{
		callback();
	}	
}
client.on('error', function(data) {
	console.log('error: ' + data);
});


client.on('close', function() {
	//client.destroy();
	console.log('\t Connection closed');
});

client.on('end', function(data) {
	console.log('\t end');
	socketopen = false;
});


client.on('data', function(data) {
	console.log('data: ' + data.toString('hex'));
});
		
async.whilst(
    function() { return 1;},
    function(callback) {
    	setTimeout(function(){
			
    	connect(function(){
    		/* strope effect */
    		if(led_on){
    			led_on = false;
					CMD_SETCOLOR[4] = 0x00;
					CMD_SETCOLOR[5] = 0x00;
					CMD_SETCOLOR[6] = 0x00;
				}else{
					led_on = true;
					CMD_SETCOLOR[4] = 0x70;//0xfa / 20;
					CMD_SETCOLOR[5] = 0x70;//0x00;
					CMD_SETCOLOR[6] = 0x70;//0xff / 20;
				}
				
				client.write(CMD_CLEARPIXEL, function(){
					CMD_SETCOLOR[3] = PIXELPIN;
					client.write(CMD_SETCOLOR, function(){
						if(index === 3 ){
							index = 0;
						}else{
							index++;	
						}
						if(index > 1){
				    		PIXELPIN = 1;
				    	}else{
				    		PIXELPIN = 0;
				    	}
						client.emit('close', callback(null));
					});
				});			 
    		});
	   	},TIMEOUT);
    },
    function (err, n) {
    	//client.end(PORT, IP);
    });
