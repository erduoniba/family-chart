/**
 * 家谱图表构建脚本
 * 该脚本用于构建family-chart库，主要完成以下任务：
 * 1. 使用rollup打包源代码
 * 2. 处理样式文件
 * 3. 创建离线包和版本管理
 */

const fs = require('fs');
const execSync = require('child_process').execSync;
const archiver = require('archiver');
const path = require('path');

// 引入压缩工具
const terser = require('terser');
const CleanCSS = require('clean-css');

// 全局常量配置
const CONFIG = {
  DIST_DIR: './dist',
  SRC_DIR: './src',
  EXAMPLES_DIR: './examples',
  COMPRESSION_LEVEL: 9,
  VERSION_FILE: path.join(__dirname, 'version.json'),
  EXAMPLE_7_DIR: '7-custom-elements-and-actions',
  EXAMPLE_7_FILES: ['index.html', 'index.js', 'personNodeHandler.js'],
  PLUGIN_FILES: ['d3.v6.js', 'umd.min.js']
};

/**
 * 错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} message - 错误信息
 * @param {Function} [cleanup] - 清理函数，在错误发生时执行
 */
function handleError(error, message) {
  console.error(`❌ ${message}:`, error.message);
  process.exit(1);
}

/**
 * 文件操作工具函数
 */
const FileUtils = {
  /**
   * 确保目录存在，如果不存在则创建
   * @param {string} dirPath - 目录路径
   */
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ 创建目录成功: ${dirPath}`);
    }
  },

  /**
   * 复制文件
   * @param {string} src - 源文件路径
   * @param {string} dest - 目标文件路径
   */
  copyFile(src, dest) {
    try {
      fs.copyFileSync(src, dest);
    } catch (error) {
      handleError(error, `复制文件失败: ${src} -> ${dest}`);
    }
  },

  /**
   * 复制目录
   * @param {string} src - 源目录路径
   * @param {string} dest - 目标目录路径
   */
  copyDir(src, dest) {
    try {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`✅ 复制目录完成: ${src} -> ${dest}`);
    } catch (error) {
      handleError(error, `复制目录失败: ${src} -> ${dest}`);
    }
  },

  /**
   * 删除目录或文件
   * @param {string} path - 要删除的路径
   */
  remove(path) {
    try {
      fs.rmSync(path, { recursive: true, force: true });
      console.log(`✅ 删除成功: ${path}`);
    } catch (error) {
      console.error(`删除失败: ${path}`, error.message);
    }
  }
};

/**
 * 构建前处理函数
 * 在执行rollup打包之前的准备工作
 */
function beforeRollup() {
  console.log('🚀 开始构建流程...');
  FileUtils.ensureDir(CONFIG.DIST_DIR);
}

/**
 * 执行rollup打包
 * 使用rollup.config.js中的配置进行模块打包
 * 将src目录下的源代码打包到dist目录
 */
function rollup() {
  console.log('📦 执行rollup打包...');
  execSync('rollup -c', { encoding: 'utf-8' });
  console.log('✅ rollup打包完成');
}

/**
 * 获取下一个版本号
 * 根据日期和序号生成版本号
 * @returns {string} 新的版本号
 */
function getNextVersion() {
  let versionData = JSON.parse(fs.readFileSync(CONFIG.VERSION_FILE, 'utf8'));
  let lastVersion = versionData.lastVersion;
  
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // 获取完整年月日，如'20250417'
  const datePrefix = currentDate;
  
  if (lastVersion.startsWith(datePrefix)) {
    // 如果是同一天，序号加1
    const sequence = parseInt(lastVersion.slice(-2)) + 1;
    lastVersion = datePrefix + String(sequence).padStart(2, '0');
  } else {
    // 新的一天，序号从01开始
    lastVersion = datePrefix + '01';
  }
  
  // 更新版本号文件
  versionData.lastVersion = lastVersion;
  fs.writeFileSync(CONFIG.VERSION_FILE, JSON.stringify(versionData, null, 2));
  console.log(`✅ 更新版本号: ${lastVersion}`);
  return lastVersion;
}

/**
 * 创建ZIP压缩包
 * 将构建产物打包成ZIP文件
 * @returns {Promise} 压缩完成的Promise
 */
function createZipArchive(tempDirPath, zipFilePath) {
  console.log('📦 开始创建ZIP压缩包...');

  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: CONFIG.COMPRESSION_LEVEL }
  });

  archive.pipe(output);
  archive.directory(tempDirPath, false);

  // 监听压缩完成事件，获取文件大小并更新到version.json
  output.on('close', () => {
    const stats = fs.statSync(zipFilePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    const versionFile = path.join(__dirname, 'version.json');
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    versionData.lastZipSize = `${fileSizeInMB}MB`;
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

    // 删除临时目录
    fs.rmSync(tempDirPath, { recursive: true, force: true });

    console.log(`✅ ZIP文件已创建: ${zipFilePath}`);
    console.log(`📊 文件大小: ${fileSizeInMB}MB`);
  });

  return archive.finalize();
}

/**
 * 压缩 JavaScript 文件
 * @param {string} filePath - JS文件路径
 * @returns {Promise<void>}
 */
async function minifyJavaScript(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await terser.minify(code, {
      compress: {
        drop_console: false, // 保留 console 语句以便调试
        drop_debugger: true
      },
      mangle: true
    });
    
    if (result.error) throw new Error(result.error);
    
    fs.writeFileSync(filePath, result.code);
    console.log(`✅ 压缩JS文件: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 压缩JS文件失败: ${path.basename(filePath)}`, error.message);
  }
}

/**
 * 压缩 CSS 文件
 * @param {string} filePath - CSS文件路径
 */
function minifyCSS(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = new CleanCSS({ 
      level: {
        1: {
          all: true
        },
        2: {
          all: true,
          restructureRules: false // 避免可能的布局问题
        }
      }
    }).minify(code);
    
    fs.writeFileSync(filePath, result.styles);
    console.log(`✅ 压缩CSS文件: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 压缩CSS文件失败: ${path.basename(filePath)}`, error.message);
  }
}

/**
 * 递归处理目录中的所有JS和CSS文件
 * @param {string} dir - 目录路径
 * @returns {Promise<void>}
 */
async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js') && !file.includes('d3.v6.js')) {
      // 跳过已经压缩的文件和第三方库
      await minifyJavaScript(filePath);
    } else if (file.endsWith('.css') && !file.endsWith('.min.css')) {
      // 跳过已经压缩的CSS文件
      minifyCSS(filePath);
    }
  }
}

// 在 afterRollup 函数中添加压缩步骤
function afterRollup() {
  console.log('📝 开始后处理任务...');
  
  const version = getNextVersion();
  const tempDirName = `family-chart-${version}`;
  const tempDirPath = path.join(CONFIG.DIST_DIR, tempDirName);
  const zipFileName = `${tempDirName}.zip`;
  const zipFilePath = path.join(CONFIG.DIST_DIR, zipFileName);

  // 创建临时目录
  FileUtils.ensureDir(tempDirPath);

  // 复制源代码和样式
  FileUtils.copyDir(CONFIG.SRC_DIR, path.join(tempDirPath, 'src'));

  // 处理示例7
  const example7Dir = path.join(tempDirPath, 'examples', CONFIG.EXAMPLE_7_DIR);
  FileUtils.ensureDir(example7Dir);

  CONFIG.EXAMPLE_7_FILES.forEach(file => {
    const srcPath = path.join(CONFIG.EXAMPLES_DIR, CONFIG.EXAMPLE_7_DIR, file);
    const destPath = path.join(example7Dir, file);
    FileUtils.copyFile(srcPath, destPath);
  });

  // 处理插件
  const pluginsDir = path.join(tempDirPath, 'examples/plugins');
  FileUtils.ensureDir(pluginsDir);
  
  CONFIG.PLUGIN_FILES.forEach(file => {
    const srcPath = path.join(CONFIG.EXAMPLES_DIR, 'plugins', file);
    const destPath = path.join(pluginsDir, file);
    FileUtils.copyFile(srcPath, destPath);
  });

  // 添加压缩步骤
  console.log('🔍 开始压缩 JavaScript 和 CSS 文件...');
  processDirectory(tempDirPath)
    .then(() => {
      console.log('✅ 文件压缩完成');
      // 创建ZIP压缩包
      createZipArchive(tempDirPath, zipFilePath);
    })
    .catch(error => {
      console.error('❌ 文件压缩过程中出错:', error);
      // 即使压缩出错，仍然创建ZIP压缩包
      createZipArchive(tempDirPath, zipFilePath);
    });
}

// 按顺序执行构建流程
beforeRollup();
// rollup();
afterRollup();