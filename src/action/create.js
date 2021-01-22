/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const axios = require('axios');
const Inquirer = require('inquirer');
const path = require('path');
const fs = require('fs')
const { wrapFetchAddLoading } = require( '../utils/common');
const { promisify } = require('util');
let { ncp }  = require('ncp');
ncp = promisify(ncp);
const MetalSmith = require('metalsmith'); // 遍历文件夹
let { render } = require('consolidate').ejs;
render = promisify(render); // 包装渲染方法

// 封装 download-git-repo 为 promise
let downLoadGitRepo = require('download-git-repo');
downLoadGitRepo = promisify(downLoadGitRepo);
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;

// 获取仓库列表
const config = require('./config');
const repoUrl = config('getVal', 'repo');
const fetchRepoList = async() => {
  // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
  let { data } = await axios.get(`https://api.github.com/orgs/${repoUrl}/repos`)
  return data
}

// 获取所有tag
const fetchTagList = async (repo) => {
  const { data } = await axios.get(`https://api.github.com/repos/gt-cli/${repo}/tags`)
  return data
}

// 下载模板的方法
const download = async (repo, tag) => {
  let api = `gt-cli/${repo}`; // 下载目录
  if(tag) {
    api += `#${tag}`
  }
  const dest = `${downloadDirectory}/${repo}`; // 将模板下载到对应的目录中
  await downLoadGitRepo(api, dest);
  return dest; // 返回下载目录
}

// 生成模板
const compiler = async (target, projectName) => {
  // 没有ask文件说明不需要编译
  if (!fs.existsSync(path.join(target, 'ask.js'))) {
    await ncp(target, path.join(path.resolve(), projectName));
  } else {
    await new Promise((resovle, reject) => {
      MetalSmith(__dirname)
        .source(target) // 遍历下载的目录
        .destination(path.join(path.resolve(), projectName)) // 输出渲染后的结果
        .use(async (files, metal, done) => {
          // 弹框询问用户
          const result = await Inquirer.prompt(require(path.join(target, 'ask.js')));
          const data = metal.metadata();
          Object.assign(data, result); // 将询问的结果放到metadata中保证在下一个中间件中可以获取到
          delete files['ask.js'];
          done();
        })
        .use((files, metal, done) => {
          Reflect.ownKeys(files).forEach(async (file) => {
            let content = files[file].contents.toString(); // 获取文件中的内容
            if (file.includes('.js') || file.includes('.json')) { // 如果是js或者json才有可能是模板
              if (content.includes('<%')) { // 文件中用<% 我才需要编译
                content = await render(content, metal.metadata()); // 用数据渲染模板
                files[file].contents = Buffer.from(content); // 渲染好的结果替换即可
              }
            }
          });
          done();
        })
        .build((err) => { // 执行中间件
          if (!err) {
            resovle();
          } else {
            reject();
          }
        });
    });
  }
}

// 创建项目
module.exports = async (projectName) => {
  let repos = await wrapFetchAddLoading(fetchRepoList, 'fetching repo list')();
  // 选择模板
  repos = repos.map((item) => item.name);
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choice a template to create project',
    choices: repos, // 选择模式
  });

  // 获取版本信息
  let tags = await wrapFetchAddLoading(fetchTagList, `fetching ${repo} tags`)(repo);
  // 选择版本
  tags = tags.map(item => item.name);
  const { tag } = await Inquirer.prompt({
    name: 'tag',
    type: 'list',
    message: `please choice a ${repo} tag to create project`,
    choices: tags
  });

  // 下载项目
  const target = await wrapFetchAddLoading(download, 'download template')(repo, tag);
  // 将下载的文件拷贝到当前执行命令的目录下
  await ncp(target, path.join(path.resolve(), projectName))
  // compiler(target, projectName);
};