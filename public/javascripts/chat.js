function populateList() {
    $.get("/all-messages").done(function(data) {
          //var list = $("#blogs_list");
          var inner = $('#chat-messages-inner');

          //getUpdates();
          for (var i = 0; i < data.length; i++) {
              var message = data[i];
              //console.log(message.createdAt);
              var date = new Date(message.createdAt);
               var id = 'msg-'+message._id;
               var author = message.author.username.replace(' ','-');
               if ($("#userInfo").attr("value") == message.author.username) {
                   author = "You";
               }
		       inner.append('<p id="'+id+'" class="message user-'+author+'">'
										+'<span class="msg-block"><strong class="author">'+author+'</strong> <span class="time">- '+date.toDateString()
										+"--" +date.getHours()
										+":" +date.getMinutes()
										+'</span>'
										+'<span class="msg">'+message.content+'</span></span></p>');
		       $('#'+id).hide().fadeIn(800);
		       $('#chat-messages').animate({ scrollTop: inner.height() },5);
          }
    }).fail(function(xhr, status, errorThrown) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}


$(document).ready(function(){
    populateList();

    var socket = io.connect();
    var me = $("#userInfo").attr("value");
	
	var msg_template = '<p><span class="msg-block"><strong class="author"></strong><span class="time"></span><span class="msg"></span></span></p>';
	
	$('.chat-message button').click(function(){
		var input = $(this).siblings('span').children('input[type=text]');		
		if(input.val() != ''){
			$.post("/add-message", {content: input.val(), author: $("#userInfo").attr("name")})
			.done(function (data) {
			    if (data.notification == "Add message successfully.") {
			        socket.emit('say', {message: data.message});
			    }
			});
		}
	});
	
	$('.chat-message input').keypress(function(e){
		if(e.which == 13) {
		    var input = $(this).val();
			if(input != ''){
				$.post("/add-message", {content: input, author: $("#userInfo").attr("name")})
			    .done(function (data) {
			        console.log(data);
			        if (data.notification == "Add message successfully.") {
			            socket.emit('say', {message: data.message});
			        }
			    });
			}		
		}
	});
	


    socket.on('say', function (data) {
         var inner = $('#chat-messages-inner');
         var date = new Date(data.message.createdAt);
         var id = 'msg-'+data.message._id;
         var author = data.message.author.username.replace(' ','-');
         if ($("#userInfo").attr("value") == data.message.author.username) {
             author = "You";
         }
		 inner.append('<p id="'+id+'" class="message user-'+author+'">'
							+'<span class="msg-block"><strong class="author">'+author+'</strong> <span class="time">- '+date.toDateString()
							+"--" +date.getHours()
							+":" +date.getMinutes()
							+'</span>'
							+'<span class="msg">'+data.message.content+'</span></span></p>');
		 $('#'+id).hide().fadeIn(800);
		 $('.chat-message input').val('').focus();
		 $('#chat-messages').animate({ scrollTop: inner.height() },1000);
    });


});