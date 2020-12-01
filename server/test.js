const { exec, spawn } = require('child_process');
const { cpuUsage, send } = require('process');
const kill = require('kill-port');



let r = spawn("cmd", ['/C','serve' ,'-s', '../build']);
r.stdout.on("data", (chunk) => {
  console.log(chunk+"");
  kill(5000, 'tcp').then((value) => {
    console.log(value)
  })
})
r.on("exit", (code, sig) => {
  console.log("code", code, "sig", sig)
})
// console.log(r.stdout);

return;

exec('git pull', (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  } else {
    if (stdout.indexOf("Already up to date.") != -1 || stdout.indexOf("이미") != -1) console.log("Already up to date.");
    else console.log(stdout);

    switch (process.platform) {
      case "win32": {
          exec('npm run winBuild', (err, stdout, stderr) => {
            if (err) {
              console.log("Build Error", err);
              return;
            }
            console.log(`Build Sucess, ${process.platform}`);
          });
          break;
      }
      case "darwin": {
        
        exec('npm run build', (err, stdout, stderr) => {
          if (err) {
            console.log("Build Error", err);
            return;
          }
          console.log(`Build Sucess, ${process.platform}`);
        });
        break;
      }
        
    }
  }
});