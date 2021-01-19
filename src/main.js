/* eslint-disable no-undef */
const program = require('commander');
const { version } = require('./utils/constants');

// 版本
program.version(`gt-cli @${version}`)
  .usage(`<command> [option]`)

// 解析用户执行命令传入的参数
program.parse(process.argv);
