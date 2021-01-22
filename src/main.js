/* eslint-disable no-undef */
const program = require('commander');
const { version } = require('./utils/constants');
const chalk = require('chalk');
const path = require('path');

// 创建模板
program
  .command('create <project-name>') // 命令名称
  .description('create a new project') // 命令的描述
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((name, cmd) => { // 动作
    require(path.resolve(__dirname, 'action', 'create'))(name, cmd);
  })
  .alias('cr') // 命令的别名

// 配置配置文件
program
  .command('config [value]') // 命令名称
  .description('inspect and modify the config') // 命令的描述
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>', 'set value to config')
  .option('-d, --delete <path>', 'delete option from config')
  .action((v, cmd) => { // 动作
    if(!cmd || cmd && Object.keys(cmd).keys().length === 0) return
    const a = Object.keys(cmd)[0]
    const k = cmd[a]
    require(path.resolve(__dirname, 'action', 'config'))(a, k, v);
  })
  .alias('c') // 命令的别名

program.on('--help', () => {
  console.log()
  console.log(`Run ${chalk.cyan('gt-cli <command> --help')} show details`);
  console.log()
});

program
  .command('*') // 命令名称
  .description('command not found') // 命令的描述

// 版本
program.version(`gt-cli @${version}`)
  .usage(`<command> [option]`)

// 解析用户执行命令传入的参数
program.parse(process.argv);
