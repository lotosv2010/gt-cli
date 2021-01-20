const formatArgs = (cmd) => {
  const args = {}
  cmd.options.forEach(o => {
    console.log(o.long, cmd.force)
    const key = o.long.slice(2);
    if(cmd[key]) args[key] = cmd[key];
  })
  return args;
}
module.exports = {
  formatArgs
}