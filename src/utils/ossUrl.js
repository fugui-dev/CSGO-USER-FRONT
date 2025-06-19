// 创建一个全局的 OSS URL 工具
const ossBaseUrl = import.meta.env.VITE_OSS_ADDRESS

export const ossUrl = (path) => {
  if (!path) return ''
  // 如果已经是完整的 URL，直接返回
  if (path.startsWith('http')) return path
  // 确保路径开头没有多余的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${ossBaseUrl}${cleanPath}`
} 