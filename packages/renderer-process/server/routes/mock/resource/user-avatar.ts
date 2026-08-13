/**
 * Mock: 用户头像
 * GET /mock/resource/user-avatar
 *
 * 模拟后端头像接口，重定向到本地静态图片 public/640.png
 */
export default defineEventHandler((event) => {
  // 重定向到 /640.png
  sendRedirect(event, '/640.png');
});
