const regex = /[;&|`]\s*(whoami|id|hostname|uname)\b/i;
const sep = '&';
const cmd = 'whoami';
const payload = "test " + sep + " " + cmd;
console.log("Payload:", payload);
console.log("Encoded:", encodeURIComponent(payload));
console.log("Result:", regex.test(payload));
