/* eslint-disable no-undef */
const axios = require('axios');
const Inquirer = require('inquirer');
const path = require('path');
const { wrapFetchAddLoading } = require( '../utils/common');
const { promisify } = require('util');
let { ncp }  = require('ncp');
ncp = promisify(ncp);

// 封装 download-git-repo 为 promise
let downLoadGitRepo = require('download-git-repo');
downLoadGitRepo = promisify(downLoadGitRepo);
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;

// 获取仓库列表
const fetchRepoList = async() => {
  // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
  let { data } = await axios.get('https://api.github.com/orgs/gt-cli/repos')
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
};