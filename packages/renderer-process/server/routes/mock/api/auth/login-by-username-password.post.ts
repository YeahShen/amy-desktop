import type { User } from '@amy/shared';

/**
 * Mock: 用户名密码登录
 * POST /mock/auth/login-by-username-password
 *
 * 模拟后端 /api/user/loginByUsernamePassword 接口，
 * 用于前端独立开发时无需启动后端服务即可调试登录流程。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);

  const { username, password } = body || {};

  // 参数校验
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名和密码不能为空',
    });
  }

  // 模拟登录成功，返回 mock 数据
  const mockUser: User = {
    id: 'mock-user-001',
    username,
    nickname: username,
    email: `${username}@example.com`,
    avatar: '/mock/resource/user-avatar',
    phone: '12345678910',
  };

  const mockToken = 'mock-token-' + Date.now();

  return {
    user: mockUser,
    token: mockToken,
  };
});
