import http from 'node:http';

export function checkIPv6HTTP(timeoutMs = 3000) {
  return new Promise((resolve) => {
    // ipv6.icanhazip.com 是一个仅返回调用方 IPv6 地址的服务
    const req = http.get('http://ipv6.icanhazip.com', { family: 6 }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}
