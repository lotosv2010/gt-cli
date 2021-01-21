const axios = require('axios');
const ora = require('ora');
const Inquirer = require('inquirer');

// 获取仓库列表
const fetchRepoList = async() => {
  // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
  let { data } = await axios.get('https://api.github.com/orgs/gt-cli/repos')
  return data

}
// 创建项目
module.exports = async (projectName, cmd) => {
  const spinner = ora('fetching repo list');
  spinner.start(); // 开始loading
  let repos = await fetchRepoList();
  spinner.succeed(); // 结束loading
  // 选择模板
  repos = repos.map((item) => item.name);
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choice repo template to create project',
    choices: repos, // 选择模式
  });
  console.log(projectName, cmd);
  console.log(repo);
};