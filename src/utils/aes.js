/**
 * AES加密工具类
 * 使用CryptoJS库进行AES加密
 * 需要安装: npm install crypto-js
 */

import CryptoJS from 'crypto-js'

// 默认密钥（必须与后端保持一致）
const DEFAULT_KEY = 'CSGO2024SecretKey'

/**
 * AES加密
 * @param {String} data 待加密的数据
 * @param {String} key 密钥（可选，默认使用DEFAULT_KEY）
 * @returns {String} 加密后的Base64字符串
 */
export function encrypt(data, key = DEFAULT_KEY) {
  try {
    // 确保密钥长度为16、24或32字节
    const adjustedKey = adjustKey(key)
    
    // 使用AES加密，模式为ECB，填充为PKCS5Padding
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(data),
      CryptoJS.enc.Utf8.parse(adjustedKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    
    // CryptoJS默认toString()返回的是包含格式信息的字符串
    // 我们需要返回纯Base64字符串，与Java后端兼容
    // 使用ciphertext获取加密后的WordArray，然后转换为Base64
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
  } catch (error) {
    console.error('AES加密失败:', error)
    throw new Error('加密失败: ' + error.message)
  }
}

/**
 * AES解密
 * @param {String} encryptedData 加密后的Base64字符串
 * @param {String} key 密钥（可选，默认使用DEFAULT_KEY）
 * @returns {String} 解密后的原始数据
 */
export function decrypt(encryptedData, key = DEFAULT_KEY) {
  try {
    // 确保密钥长度为16、24或32字节
    const adjustedKey = adjustKey(key)
    
    // 将Base64字符串转换为WordArray
    const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedData)
    
    // 创建加密参数对象
    const encrypted = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedWordArray
    })
    
    // 解密
    const decrypted = CryptoJS.AES.decrypt(
      encrypted,
      CryptoJS.enc.Utf8.parse(adjustedKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    
    // 转换为UTF-8字符串
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('AES解密失败:', error)
    throw new Error('解密失败: ' + error.message)
  }
}

/**
 * 调整密钥长度
 * 如果密钥长度不是16、24或32字节，则截取或填充
 */
function adjustKey(key) {
  const len = key.length
  if (len === 16 || len === 24 || len === 32) {
    return key
  } else if (len < 16) {
    // 如果长度小于16，用0填充
    return key.padEnd(16, '0').substring(0, 16)
  } else if (len < 24) {
    // 如果长度在16-24之间，截取到16
    return key.substring(0, 16)
  } else if (len < 32) {
    // 如果长度在24-32之间，截取到24
    return key.substring(0, 24)
  } else {
    // 如果长度大于32，截取到32
    return key.substring(0, 32)
  }
}
