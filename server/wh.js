const express = require('express');
const app = express();
const { exec, spawn } = require('child_process');
const kill = require('kill-port');
const servicePort = 80;

let service;
let preparing = false;
let serverOnline = false;

const bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve()
        }, time);
    });
}

function startServer(platform) {
    if (serverOnline) return;
    switch (platform) {
        case "win32": {

            serverOnline = true;
            service = spawn("cmd", ['/C','serve' ,'-s', '../build', '-l', servicePort, '-n']);
            service.stdout.on("data", (chunk) => {console.log(chunk+"")});
            console.log("Server started");
            break;

        }
        case "linux": {

            serverOnline = true;
            service = spawn("sh", ['run.sh']);
            service.stdout.on("data", (chunk) => {console.log(chunk+"")});
            console.log("Server started");
            break;

        }
        default: console.log("This platform is not support!"); break;
    }
}

async function stopServer() {
    return new Promise(async (resolve, reject) => {

        await kill(servicePort, "tcp");
        serverOnline = false;
        console.log("Server is stopped");
        resolve();

    });
}

async function Prepare(req, res) {
    if (preparing) {
        // res.send({status: "PREPARING_DATA"});
        await sleep(250);
        Prepare(req, res);
        return;
    }
    preparing = true;

    let timer = Date.now();
    console.log("---------- New Commit has Arrive ----------");
    // console.log(`${now.getFullYear()}/${now.getMonth()}/${now.getDate()} ${now.getHours()}:${now.getDate()}:${now.getSeconds()}`);
    exec('git pull', async (err, stdout, stderr) => {
        if (err) {
            res.send({status: "GIT_PULL_ERR", err: err});
            console.log("git pull: ", err)
        } else {
            if (stdout.indexOf("Already up to date.") != -1 || stdout.indexOf("이미") != -1) console.log("Already up to date.");//{res.send({status: "NOTHING_TO_UPDATE"}); console.log("Already up to date."); return;}
            else console.log(stdout);

            console.log("-------------- Build Start --------------");
            await stopServer();
            switch (process.platform) {
                case "win32": {

                    let build = exec('npm run winBuild', (err, stdout, stderr) => {
                        if (err) {
                            res.send({status: "BUILD_ERROR", err: err});
                            console.log("Build Error", err);
                            build.kill();
                            return;
                        }
                        console.log(`-------------- Build Sucess, ${process.platform}, executetime: ${Date.now()-timer}ms --------------`);
                        res.send({status: "BUILD_SUCESS"});

                        preparing = false;
                        startServer(process.platform);
                    });
                    break;

                }
                case "linux": {
                    
                    let build = exec('npm run build', (err, stdout, stderr) => {
                        if (err) {
                            res.send({status: "BUILD_ERROR", err: err});
                            console.log("Build Error", err);
                            build.kill();
                            return;
                        }
                        console.log(`-------------- Build Sucess, ${process.platform}, executetime: ${Date.now()-timer}ms --------------`);
                        res.send({status: "BUILD_SUCESS"});

                        preparing = false;
                        startServer(process.platform);
                    });
                    break;

                }
                default: console.log("This platform is not support!"); break;
            }
        }
    });
}

app.post("/wh", async (req, res) => {
    Prepare(req, res);
});

app.listen(3777, () => {
    startServer(process.platform);
    console.log("webhook server is open 3777");
})
