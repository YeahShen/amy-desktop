import type { User } from '@amy/shared';

/**
 * Mock: 更新用户资料
 * POST /mock/api/user/update-info
 *
 * 模拟后端更新接口，回显提交的资料。真实数据的持久化由后端负责，
 * 这里仅用于前端独立开发时联调保存流程。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<User>>(event);

  return {
    user: body ?? {},
  };
});