const axios = require('axios');

// 获取仓库列表
const fetchRepoList = async() => {
  console.log(111)
  // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
  let { data } = await axios.get('https://api.github.com/orgs/gt-cli/repos')
  return data

}
// 创建项目
module.exports = async (projectName, cmd) => {
  let repos = await fetchRepoList();
  repos = repos.map(item => item.name)
  console.log(repos)
  console.log(projectName, cmd);
};