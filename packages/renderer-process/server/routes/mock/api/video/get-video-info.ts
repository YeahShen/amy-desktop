/**
 * Mock: 视频播放详情
 * GET /mock/video/get-video-info?id=
 *
 * 模拟后端 /video/get-video-info，让播放器页面在 mock 模式下无需后端即可跑通。
 */
export default defineEventHandler((event) => {
  const { id } = getQuery(event);

  return {
    id: String(id ?? ''),
    title: '演示视频',
    description: 'mock 模式下的示例视频',
    poster: '/640.png',
    url: '/flower.mp4',
  };
});
