var http = require("http");
var fs = require("fs");
const { Script } = require("vm");
const { Cipher } = require("crypto");
var success = 200;
var err = 400;

// it can return the file requested by browser
function readFile(url, content, res)
{
    fs.readFile(url, function(err, data) 
    {
        if(err) 
        {
            console.log(err );
        }
        else 
        {
            res.writeHead(success , {'Content-type' : content});
            res.write(data);
            res.end();
        }
    })
}

// it can read the data sent by Script.js file by parsing it and send data through callback
function readJSON(request, callback) 
{
    var body = '';
    request.on('data', function(chunk)
    {
        body += chunk;
    }); 
    
    request.on('end', function() 
    {
        var data = JSON.parse(body);
        callback(data);
    });
}

// it can write data to data.txt file
function writeData(data, callback) 
{
    fs.writeFile("./data.txt", data, function (err) {
        if(err)
        {
            throw err;
        }
        callback();
    })
}

// it is reading data from data.txt file and sending data through callback(data)
function readData(callback) {
    fs.readFile("./data.txt", function (err, data) {
        if(err) {
            throw err;
        }
        callback(data);
    })
}

function writeToFile(all_data, response, code, data) 
{
    writeData(JSON.stringify(all_data), function () {
        response.writeHead(code);
        // response.write("fail")
        response.end(data);
    });
}

// receptionist function to handle request and response
function receptionist(request, response) {
    // console.log(request.url);
    var method = request.method;

    if(method === "GET") 
    {
        if(request.url === "/") 
        {
            readFile("./view/index.html", "text/html", response);
        }
        else if(request.url === "/style.css") 
        {
            readFile("./view/css/style.css", "text/css", response);
        }
        else if(request.url === "/script.js") 
        {
            readFile("./view/js/script.js", "text/javascript", response);
        }
    }
    else if(method === "POST") 
    {
        if(request.url === "/tasks") 
        {
            var code = err;
            readJSON(request, function(data) 
            {
                readData( function (all_data) 
                {
                    if(all_data.length === 0) 
                    {
                        all_data = [];
                    }
                    else 
                    {
                        all_data = JSON.parse(all_data);
                    }
                    var bool = true;
                    all_data.forEach(d => 
                    {
                        if(d["text"] === data["text"] && bool) 
                        {
                            response.writeHead(202, {'Content-Type': 'text/plane'});
                            response.end();
                            bool = false;
                        }
                    });
                    if(bool) 
                    {
                        all_data.push(data);
                        code = success;
                        writeToFile(all_data, response, code, data["text"]);
                    }
                });

            });
        }
        else if(request.url === "/done")
        {
            readJSON(request, function (data) 
            {
                readData( function(all_data)
                {
                    var code = err;
                    all_data = JSON.parse(all_data);
                    for (let index = 0; index < all_data.length; index++) {
                        var temp = all_data[index]['text'].split(" ");
                        var i = temp[0];
                        if(temp.length > 1) 
                        {
                            i = "";
                            temp.forEach( data => {
                                i += data + "_";
                            });
                        }
                        if(i === data['text']) {
                            all_data[index]['done'] = !all_data[index]['done'];
                            code = success;
                            break;
                        }                   
                    }
                    writeToFile(all_data, response, code, "");
                });    
            });
        }
        else if(request.url === "/delete")
        {
            readJSON(request, function(data) 
            {
                readData( function(all_data)
                {
                    var code = err; //let the data is not deleted
                    all_data = JSON.parse(all_data); //array in all_data
                    for (let index = 0; index < all_data.length; index++) {
                        var temp = all_data[index]['text'].split(" ");
                        var i = temp[0];
                        if(temp.length > 1) 
                        {
                            i = "";
                            temp.forEach( data => {
                                i += data + "_";
                            });
                        }
                        if(i === data['text']) {
                            all_data.splice(index, 1);   //deleting data from data file
                            code = success; //data get deleted successfully
                            break;
                        }                   
                    }
                    writeToFile(all_data, response, code, "");
                });
            });
        }
        else if(request.url === "/all_tasks") 
        {
            readData(function(all_tasks) 
            {
                // all_tasks = JSON.stringify(all_tasks);
                // response.write(all_tasks);
                response.writeHead(success, {'Content-Type': 'text/plain'});
                response.end(all_tasks);
            });
        }
    }
}

var server_setup = http.createServer(receptionist);
server_setup.listen(3000);
console.log("server running");