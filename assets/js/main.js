$(document).ready(function() {
	
	let a;

	$.ajax({
		url: '127.0.0.1:1818/person',
		type: 'get',
		success: function(data) {
			console.log('lolo');
		},
		statusCoe:{
			404: function() {
				alert('lolo')
			}
		}
	});

});
