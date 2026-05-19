const regex = /[;&|`]\s*(whoami|id|hostname|uname)\b/i;
const separators = [';', '|', '&', '`'];
const commands = ['whoami', 'id', 'hostname', 'uname'];
for (const cmd of commands) {
  for (const sep of separators) {
    const payload = sep === '`' ? "test" + sep + cmd + sep : "test " + sep + " " + cmd;
    const url = "https://example.com/api/test?cmd=" + payload;
    const urlObj = new URL(url);
    const value = urlObj.searchParams.get('cmd');
    console.log(payload, "->", value, "->", regex.test(value));
  }
}
