const regex = /[;&|`]\s*(whoami|id|hostname|uname)\b/i;
console.log(";whoami", regex.test(";whoami"));
console.log("test ; whoami", regex.test("test ; whoami"));
console.log("whoami", regex.test("whoami"));
