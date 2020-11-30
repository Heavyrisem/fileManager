const os = require('os');
const cpuStat = require('cpu-stat');
const unit = require('unitchanger');

const cpu = {
  Core: { 
    name: os.cpus()[0].model,
    speed: os.cpus()[0].speed,
    core: os.cpus().length
  }
}

console.log();
console.log("CPU INFO", cpu);
setInterval(() => {

  cpuStat.usagePercent((err, percent, seconds) => {
    console.log(unit.ByteCal(os.totalmem()), unit.ByteCal(os.freemem()));
    console.log(percent, seconds);
  })

}, 500);