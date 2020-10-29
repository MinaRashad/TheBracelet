var http = require('http')
var pythonShell = require('python-shell') //*used for testing connections
var fs = require('fs')                    //*used for creating files
var qs = require("qs")
var events = require('events')
var locationAnalyser = require('./locationAnalyser')
var sqlite3 = require('sqlite3').verbose()

//Constants
let db = new sqlite3.Database('./points.db',(err)=>{
    console.log('Error reading Database')
})

//Variables
var dbName = "./points.xy"
var points
var emmiter = new events.EventEmitter()
var online = []
//tring to see if the database exists
fs.access(dbName,(err)=>{
    if(err){
        //if it does not exist it will throw an error
        //to handle it we will create a new database
        console.log('DataBase Does not exist Creating one...')
        fs.writeFile(dbName,"",(err)=>{
            if(err){console.log(`Failed to create File, ${err}`)}
        })
    }
    //then we will read its contents
    fs.readFile(dbName,(err,data)=>{
        readableData = data.toString('utf-8')
        points = readableData
    })
})
//creation of the server
var server = http.createServer((req,res)=>{
    var local_ip = req.connection.localAddress  //local ip of the client
    var remote_ip = req.connection.remoteAddress//remote ip of the client
    if(online.indexOf(remote_ip)==-1)
    {
        //we will show who is connected to the server
        console.log(`========${remote_ip} is Online========`)
        online.push(remote_ip)
    }
    res.writeHead(200)
    //now we will look to see if the were sent data
    //if the x,y were sent
    if(req.method == 'POST'){
        handleSentData(req,res)   
    }
    //At the end we will just write the points
    res.write(points)
    res.end()
        //THE END of RESPOND
})
/**************************************************************/
var handleSentData=(req,res)=>{
    /*
    **first we will read the data sent
    **the function will save the data in 
    **an object called 'post'
    **after the data are fully recieved
    **the processing will begin
    */

    readPOSTrequest(req)
    emmiter.on('recieved',()=>{
        /*SENDING POSITION HANDLING*/
        if(post.x && post.y){
            //we will read the contents of the database
            fs.readFile("./points.xy",(err,data)=>{
                if(err)console.log(err)
                //then add the new data to old data
                processPoint({'x':post.x,'y':post.y},data,dbName)
            })
        }else{
            console.log('warning:data were sent but server does not recognise it')
            console.log('You can ignore this as long as it is running')
        }
    })
    
}
const readPOSTrequest = (req)=>{
    body = ''
    post = ''
    req.on('data',(data)=>{
        body+=data

        if(body.length >= 1e6){
            req.connection.destroy()
        }
    })
    req.on('end',()=>{
        post = qs.parse(body)
        emmiter.emit('recieved')

    })

}

var processPoint = (point,data,db)=>{
    //get current points
    let crntPoints = locationAnalyser.readPoints(db)
    //see if it is suspicious
    if(!locationAnalyser.isSuspicious(point,crntPoints)
    || crntPoints <= 50){
        let newdata = data
        newdata = newdata +`${point.x},${point.y}\n`
        //update points
        points = newdata
        fs.writeFileSync('./points.xy',newdata)
    }else{
        console.log('WARNING:CLIENT IS HEADING TO UNUSUAL LOACTION')
        console.log(`CURRENT POSITION IS (${point.x},${point.y})`)
    }
}




var port =3005                  //the port to listen on
server.listen(port,"0.0.0.0") //listening on localhost



//connection tests
/*
**First It will create a python file
**then type in it testing code, in other words it 
**will write code for the python file
**Send requests to the server to test it 
*/
console.log('Running Connection Tests...')
//python code
var testerpy = (
`import requests;hostIP = 'http://0.0.0.0'
port = ${port}
R = requests.post(f'{hostIP}:{port}/test',{'xtest':5,'ytest':6})
`)
//creating the file
fs.writeFile('./tester.py',testerpy,(err)=>{
    if(err)console.log(err)
    //running it after creation
    pythonShell.PythonShell.run("./tester.py",{},(err)=>{
        if(err){
            //an error handler if it failed
            console.log("An Error Happened! Server Did not Run successfully!")
            server.setTimeout(100)
        }else{
        //stating the server on the console, including the link
        console.log('Success! Server is running')
        console.log(`listening on localhost:${port}`)
        }
    })

})
