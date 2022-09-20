
# Node.js实现
## Demo版本
### __使用指南__
```bash
git clone https://github.com/HDU-Nbsp/Bcrypt-demo.git
cd Bcrypt-demo
npm install # 下载项目依赖
```
**使用nodemon管理代码**
```bash
npm install nodemon -g # 全局安装nodemon
nodemon ./demo.js # 运行代码
```
也可以不使用nodemon,直接执行`node ./demo.js`
## 持久化储存
使用`bcrypt.js`库作为bcrypt算法的加密逻辑。（[GitHub仓库地址](https://github.com/dcodeIO/bcrypt.js)）
<a name="xXq0G"></a>
### 0. 使用指南
```bash
git clone https://github.com/HDU-Nbsp/Bcrypt-demo.git
cd Bcrypt-demo
npm install # 下载项目依赖
```
**使用nodemon管理代码**
```bash
npm install nodemon -g # 全局安装nodemon
nodemon ./index.js # 运行代码
```
<a name="OgNXv"></a>
### 1. 初始化数据库表
首先创建一张含有数个用户和密码明文以及使用bcrypt算法加密后的哈希密码的user表
```javascript
// 初始化数据库
console.log('初始化数据库...')
// 导入sequelize
const { Sequelize, DataTypes, Model } = require('sequelize')

// 连接数据库
const sequelize = new Sequelize('bcrypt', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
})

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: { // 明文密码
    type: DataTypes.STRING,
    allowNull: false
  },
  hash: { // 密码哈希值
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize, // 我们需要传递连接实例
  modelName: 'User' // 我们需要选择模型名称
})

async function init () {
  try {
    await User.sync({ alter: true })
    await sequelize.authenticate()
    console.log('\n数据库成功连接.\n')
    // 查看User表是否为空
    const count = await User.count()
    if (count === 0) {
      console.log('User表为空，开始初始化数据...')
      // 初始化数据
      const user1 = await User.create({
        account: 'admin',
        password: '123456'
      })
      const user2 = await User.create({
        account: 'root',
        password: 'root'
      })
      const user3 = await User.create({
        account: 'test',
        password: 'test-123@hdu'
      })
      console.log('初始化数据成功！')
      return false
    } else {
      console.log('User表不为空，无需初始化数据！')
      return true
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    // 退出程序
    process.exit(1)
  }
}
```
使用sequelize orm框架初始化数据库，生成带有用户名和密码明文的数据库表。<br />之后，在index.js中通过调用bcryptjs对密码明文进行加密，生成哈希值并存入数据库。
```javascript
// 导入bcrypt.js包
var bcrypt = require('bcryptjs')
var salt = bcrypt.genSaltSync(10)  // 设置salt参数进行加密

// 首先运行init.js文件，创建数据库
const database = require('./init')

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
```
**得到数据库表：**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/22799427/1663585656379-96723dad-da1d-4833-a083-8bf8780edc57.png#clientId=u0d48130d-740e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=118&id=ub32b5415&margin=%5Bobject%20Object%5D&name=image.png&originHeight=235&originWidth=2032&originalType=binary&ratio=1&rotation=0&showTitle=false&size=68844&status=done&style=none&taskId=uc352697f-176e-40aa-bf74-c4b09e75800&title=&width=1016)
<a name="mquVI"></a>
### 2. 用户输入账号密码并进行比对
调用js _**readline模块编写异步输入方法，用于获得用户输入的账号密码
```javascript
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
```
获取账号密码并与数据库哈希值比对
```javascript
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
```
<a name="o6MmD"></a>
### 3. 实现效果展示
![image.png](https://cdn.nlark.com/yuque/0/2022/png/22799427/1663585701346-54733065-2617-4575-9b4a-a0d4d2cbcd9d.png#clientId=u0d48130d-740e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=162&id=u43c6b45e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=323&originWidth=1255&originalType=binary&ratio=1&rotation=0&showTitle=false&size=69504&status=done&style=none&taskId=ub28d1235-97e9-45e4-93aa-8ba2ca3811f&title=&width=627.5)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/22799427/1663585760314-f6a65f07-54ae-4e5e-919f-eff155230699.png#clientId=u0d48130d-740e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=175&id=uaf8ce38d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=349&originWidth=1274&originalType=binary&ratio=1&rotation=0&showTitle=false&size=79384&status=done&style=none&taskId=ud048c4f6-5932-4847-af8c-26b9e635a5f&title=&width=637)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/22799427/1663585778230-16b7a7c1-396b-4ee5-aa1b-100444c2a21a.png#clientId=u0d48130d-740e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=178&id=u018d04a5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=356&originWidth=1249&originalType=binary&ratio=1&rotation=0&showTitle=false&size=72538&status=done&style=none&taskId=ubd2239e3-cdfe-4c83-9b2e-ba589e501a5&title=&width=624.5)<br />通过匹配明文与哈希值后，返回登录结果
<a name="zRXsK"></a>
### Default: 数据库构造函数
以下是数据库的setter、getter等构造函数
```javascript
async function getPassword (acc) {
  // 根据account获取对应密码
  let user = await User.findOne({
    where: {
      account: acc
    }
  })
  return user.password
}

async function setHash (acc, hash) {
  // 根据account更新对应密码哈希值
  try {
    let user = await User.findOne({
      where: {
        account: acc
      }
    })
    user.hash = hash
    await user.save()
  } catch (error) {
    console.log('将哈希值存入数据库时发生错误' + error)
  }
}

async function getHash (acc) {
  // 根据account获取对应密码哈希值
  let user = await User.findOne({
    where: {
      account: acc
    }
  })
  return user.hash
}

// 导出init函数
module.exports = {
  init,
  getPassword,
  setHash,
  getHash
}
```
<a name="Q4AdP"></a>
## 进阶目标

1. 对bcrypt算法进行benchmark, 比较双向的计算速度差异
<a name="PCG3q"></a>
## 参考

- [https://www.cmd5.com/](https://www.cmd5.com/)
- [https://blog.csdn.net/nnsword/article/details/78191292](https://blog.csdn.net/nnsword/article/details/78191292)
- 从服务端密码存储到用户数据加密方案，即md5到bcrypt [https://ruby-china.org/topics/41022](https://ruby-china.org/topics/41022)
- [https://emmanuelhayford.com/understanding-the-bcrypt-hashing-function-and-its-role-in-rails/](https://emmanuelhayford.com/understanding-the-bcrypt-hashing-function-and-its-role-in-rails/)
- [https://www.cnblogs.com/2019gdiceboy/p/11121425.html](https://www.cnblogs.com/2019gdiceboy/p/11121425.html)
- [https://www.bbsmax.com/A/kvJ3Zny9zg/](https://www.bbsmax.com/A/kvJ3Zny9zg/)
