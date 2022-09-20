// 导入bcrypt.js包
var bcrypt = require('bcryptjs')
var salt = bcrypt.genSaltSync(10)  // 设置salt参数进行加密
const data = require('./data.json')

// 调用nodejs标准输入模块
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

async function getInput (message) {
  return new Promise((resolve, reject) => {
    readline.question(`${message}：`, res => {
      resolve(res)
    })
  })
}

// 查找数组中的哈希值
async function getHash (acc) {
  for (let i in data) {
    if (data[i].account === acc) {
      return data[i].hash
    }
  }
  return null
}

// 主函数
(async function main () {
  let account = await getInput('请输入账号')
  let password = await getInput('请输入密码明文')
  readline.close()
  console.log(`您输入的账号为：${account}`)
  // 匹配密码哈希值
  let hash = await getHash(account)
  if (!hash) {
    console.log('账号不存在')
    process.exit(0)
  }
  console.log(`该用户密码的哈希值为：${hash}`)
  console.log(`生成该密码所用的轮数为${bcrypt.getRounds(hash)}`)
  let match = bcrypt.compareSync(password, hash)
  if (match) {
    console.log('密码正确，登录成功')
  } else {
    console.log('密码错误')
  }
  // 退出程序
  process.exit(0)
})()
