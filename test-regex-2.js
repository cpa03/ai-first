const regex = /[;&|`]\s*(whoami|id|hostname|uname)\b/i;
const payloads = [
  "test ; whoami",
  "test | id",
  "test & hostname",
  "test`uname`"
];
payloads.forEach(p => console.log(p, "=>", regex.test(p)));
