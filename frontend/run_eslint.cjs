const cp = require('child_process');
const fs = require('fs');
const result = cp.spawnSync('npx.cmd', ['eslint', 'src/', '--format', 'json'], { encoding: 'utf8' });
if (result.stdout) {
  fs.writeFileSync('lint.json', result.stdout);
} else {
  console.log('No stdout');
}
