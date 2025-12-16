/**
 * AES加密工具测试脚本
 * 用于验证加密功能是否正常
 * 
 * 使用方法：
 * 1. 在浏览器控制台运行
 * 2. 或使用 Node.js: node test-aes.js
 */

import { encrypt, decrypt } from './aes.js'

// 测试用例
const testCases = [
  {
    name: '基本JSON数据',
    data: '{"username":"test","password":"123456"}'
  },
  {
    name: '空字符串',
    data: ''
  },
  {
    name: '特殊字符',
    data: '{"name":"测试","value":"特殊字符!@#$%^&*()"}'
  },
  {
    name: '长数据',
    data: '{"data":"' + 'a'.repeat(1000) + '"}'
  },
  {
    name: '中文数据',
    data: '{"用户名":"张三","密码":"123456"}'
  }
]

console.log('=== AES加密工具测试 ===\n')

let passCount = 0
let failCount = 0

testCases.forEach((testCase, index) => {
  try {
    console.log(`测试 ${index + 1}: ${testCase.name}`)
    console.log('原始数据:', testCase.data)
    
    // 加密
    const encrypted = encrypt(testCase.data)
    console.log('加密后:', encrypted.substring(0, 50) + '...')
    
    // 解密
    const decrypted = decrypt(encrypted)
    console.log('解密后:', decrypted)
    
    // 验证
    if (testCase.data === decrypted) {
      console.log('✅ 测试通过\n')
      passCount++
    } else {
      console.log('❌ 测试失败: 解密后的数据与原始数据不一致\n')
      failCount++
    }
  } catch (error) {
    console.error('❌ 测试异常:', error.message, '\n')
    failCount++
  }
})

console.log('=== 测试结果 ===')
console.log(`通过: ${passCount}`)
console.log(`失败: ${failCount}`)
console.log(`总计: ${testCases.length}`)

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！')
} else {
  console.log('\n⚠️  部分测试失败，请检查代码')
}
