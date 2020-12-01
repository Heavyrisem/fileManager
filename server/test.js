const { exec } = require('child_process');
exec('git pull', (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  } else {
    if (stdout.indexOf("Already up to date.") != -1) return console.log("Already up to date.");
    console.log(stdout);
  }
});