// 格式化参数
const formatArgs = (cmd) => {
  const args = {}
  cmd.options.forEach(o => {
    console.log(o.long, cmd.force)
    const key = o.long.slice(2);
    if(cmd[key]) args[key] = cmd[key];
  })
  return args;
}

// 加载动画
const ora = require('ora');
const wrapFetchAddLoading = (fn, message) => async(...args) => {
  const spinner = ora(message);
  spinner.start(); // 开始loading
  try {
    const r = await fn(...args);
    spinner.succeed(); // 结束loading
    return r
  } catch (error) {
    spinner.fail('request failed, refetch...');
    await sleep(1000);
    return wrapFetchAddLoading(fn, message); // 递归尝试
  }
  
  
}

// 睡眠函数
const sleep = async (n) => new Promise((resolve) => setTimeout(resolve, n));
module.exports = {
  formatArgs,
  wrapFetchAddLoading,
  sleep
}