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
