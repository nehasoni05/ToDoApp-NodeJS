var task = document.getElementById('task');
var list = document.getElementById('list'); 

var request = new XMLHttpRequest();
var ENTER_KEY_CODE = 13;
var STATUS_OK = 200;
var STATUS_EXIST = 202;

task.addEventListener("keydown", function(event) 
{
    if(event.keyCode === ENTER_KEY_CODE) 
    {
        event.preventDefault();
        var str = task.value.trim();
        if(str.length >= 3) 
        {
            var re = new RegExp('[a-z|A-Z| ]', 'g');
            var array = str.match(re);
            if(array.length === str.length)
            {
                var status, state, data;
                request.open('POST', '/tasks');
                request.send(JSON.stringify({ text: str , done: false}));
                // console.log(status);
                request.onload = function() {
                // console.log(status, state);
                status = request.status, state = request.readyState, data = request.response;
                if(status === STATUS_EXIST && state === 4 ) 
                {
                    notify("Task Exists");
                }
                else if(data && status === STATUS_OK) 
                {
                    addNew(data);
                }
                }
            }
            else
            {
                notify("Only english alphabets and space is allowed");
            }
        }
        else 
        {
            notify("Minimum 3 characters required");
            // alert("Task must be of minimum 3 characters");
        }
        task.value = "";
    }
});

function notify(msg) 
{
    var show = document.getElementById('corner');
    show.innerHTML = msg;
    show.style.display = "block";                
    setTimeout(() => {
        show.style.display = "none";
    }, 3000);
}

function displayAll() {
    request.open("POST", "/all_tasks");
    // console.log(request.response);
    request.send();

    request.onload= function() {
        var result;
        try
        {
            result = JSON.parse(request.response);
            // console.log(typeof result, result);
            result.forEach(element => {
                addNew(element['text']);
                if(element['done']) 
                {
                    var temp = element['text'].split(" ");
                    var i = temp[0];
                    if(temp.length > 1) {
                        i = "";
                        temp.forEach( data => {
                            i += data + "_";
                        });
                    }
                    var x = i+"checked";
                    document.getElementById(x).checked = "true";
                }
            });
        }
        catch
        {
            
        }
    }
}

function addNew(t) 
{
    // console.log("task",t);
    var temp = t.split(" ");
    var i = temp[0];
    if(temp.length > 1) {
        i = "";
        temp.forEach( data => {
            i += data + "_";
        });
    }
    // console.log(i);
    var d = document.createElement('div');
    d.setAttribute("class","line");
    d.setAttribute("id",i);
    var c = document.createElement('input');
    c.setAttribute("type","checkbox");
    c.setAttribute('onClick', "done("+ i + ")" );
    
    c.setAttribute("id", i+"checked");
    var p = document.createElement('label');
    p.setAttribute("class","left1");
    p.setAttribute("for",i+"checked")
    p.innerHTML = t;
    var span = document.createElement('span');
    span.setAttribute('onClick', "del("+ i + ")" );
    span.setAttribute("class","right2");
    span.innerHTML = "&times;";
    d.appendChild(span);
    d.appendChild(c);
    d.appendChild(p);
    list.appendChild(d); 

};

function done(task) {
    // console.log(task);
    task = task.id || task[0].id;
    // console.log(task);
    request.open('POST','/done');
    request.send(JSON.stringify({text: task}));
}

function del(t) {
    t = t.id || t[0].id;   
    var status = request.status, state = request.readyState;
    request.open('POST', '/delete');
    // request.setRequestHeader("Content-type", "text/json");
    request.send(JSON.stringify( {text: t} ));

    if (state == 4 && status == STATUS_OK) {
    
        list.removeChild(document.getElementById(t));        
    }
}