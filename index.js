// 导入bcrypt.js包
var bcrypt = require('bcryptjs')
var salt = bcrypt.genSaltSync(10)  // 设置salt参数进行加密

// 首先运行init.js文件，创建数据库
const database = require('./init')

// 调用nodejs标准输入模块
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

async function initialize () {
  let account = ''
  // 初始化数据库
  let init = await database.init()
  if (init) return
  // 读取用户输入
  let accounts = ['admin', 'root', 'test']
  passwords = ['123456', 'root', 'test-123@hdu']
  for (let i in passwords) {
    console.log(`明文密码：${passwords[i]}`)
    // 加密密码
    let hash = bcrypt.hashSync(passwords[i], salt)
    console.log(`加密后的密码为：${hash}`)
    // 将加密后的密码存入数据库
    await database.setHash(accounts[i], hash)
  }
  console.log('密码哈希值创建成功')
}

async function getInput (message) {
  return new Promise((resolve, reject) => {
    readline.question(`${message}：`, res => {
      resolve(res)
    })
  })
}

// 主函数
(async function main () {
  // 初始化数据库
  await initialize()
  let account = await getInput('请输入账号')
  let password = await getInput('请输入密码明文')
  readline.close()
  console.log(`您输入的账号为：${account}`)
  // 匹配密码哈希值
  let hash = await database.getHash(account)
  console.log(`数据库中的哈希值为：${hash}`)
  let match = bcrypt.compareSync(password, hash)
  if (match) {
    console.log('密码正确，登录成功')
  } else {
    console.log('密码错误')
  }
  // 退出程序
  process.exit(0)
})()
