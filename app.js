let express = require('express');
let app = express();
let fs = require('fs');


app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/public/client/view/index.html')
});
app.get('/person', function (req,res) {
    fs.readFile('./public/person.json','utf8', function (err, data) {
        if (err) throw err;
        let obj = JSON.parse(data);
       	res.send(obj);
    });
    console.log('lolo')

});



app.listen(1818, function() {
	console.log('lol')
})