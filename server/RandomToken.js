function RandomToken() {
    const length = 3;
    let result = "";


    const min = 97;
    const max = 122;
    for (var i = 0; i < length; i++) {
        if (Math.floor(Math.random() * 2)) {
            result += String.fromCharCode(Math.floor(Math.random() * (max - min) + min));
        } else {
            result += String.fromCharCode(Math.floor(Math.random() * (max - min) + min)).toUpperCase();
        }
    }

    return result;
}


let tot = 500;
let loop = 0;
let last = [];
let acc = [];
for (var i = 0; i < tot; i++) {

    while (1) {
        loop++;
        let tmp = RandomToken();
        if (last.indexOf(tmp) != -1) {
            acc.push(1/loop*100);
            // console.log(1/loop*100);
            break;
        } else {
            last.push(tmp);
        }
    }
    console.log(`${i} 번째 루프`);
}
{
    let tmp = 0;
    acc.forEach(ac => {
        tmp += ac;
    });
    console.log(`중복 확률 ${tmp/tot}%`);
}