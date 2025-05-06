import treeKill from 'tree-kill'

export function killProcess(pid: number) {
  return new Promise((resolve, reject) => {
    treeKill(pid, "SIGTERM", (err: any) => {
      if (err) {
        console.error(`Error killing process ${pid}:`, err)
        reject(err)
      } else {
        console.log(`Process ${pid} killed`)
        resolve(true)
      }
    })
  })
}