const fs = require('fs');
const execSync = require('child_process').execSync;


function beforeRollup() {
}

function rollup() {
  execSync('rollup -c', { encoding: 'utf-8' });
}

/**
 * 构建后处理函数
 * 复制styles目录到dist文件夹
 */
function afterRollup() {
  // copy styles directory
  fs.cpSync('./src/styles', './dist/styles', {recursive: true});
}

beforeRollup();
rollup();
afterRollup();
