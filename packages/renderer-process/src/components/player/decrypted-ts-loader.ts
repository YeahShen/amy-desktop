import { Hls } from '@videojs/hlsjs-video';
import type {
  FragmentLoaderContext,
  HlsConfig,
  Loader,
  LoaderCallbacks,
  LoaderConfiguration,
} from 'hls.js';

/**
 * 后端私有加密的 TS 分片加载器。
 *
 * 分片不是标准 HLS 加密（m3u8 里没有 #EXT-X-KEY），密钥由单独的接口下发，
 * hls.js 自带的解密路径用不上 —— 所以在默认 loader 拿到分片后自己解一次，
 * 再把明文交回 hls.js 解复用。挂载方式见 Index.vue 的 source.engine.hlsJs.fLoader。
 *
 * 只接管「解密」这一步：重试、超时、range、stats 全部沿用 hls.js 默认 loader。
 *
 * ⚠ 下面的 decodeKey / deriveIv / decryptSegment 三个函数是按后端实际算法改的地方，
 *   现在填的是最常见的一套默认实现，不是从后端确认过的。
 */

type FragmentLoaderConstructor = new (config: HlsConfig) => Loader<FragmentLoaderContext>;

/** hls.js 默认 loader（XhrLoader），延用它以保留网络行为 */
const BaseLoader = Hls.DefaultConfig.loader as unknown as FragmentLoaderConstructor | undefined;

/* ------------------------------------------------------------------------ */

/** importKey 只做一次，按密钥字符串缓存 */
const cryptoKeyCache = new Map<string, CryptoKey>();

async function getCryptoKey(rawKey: string) {
  let cached = cryptoKeyCache.get(rawKey);

  if (!cached) {
    const keyBytes = Uint8Array.from(atob(rawKey), (c) => c.charCodeAt(0));

    cached = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, [
      'decrypt',
    ]);

    cryptoKeyCache.set(rawKey, cached);
  }

  return cached;
}

/** 每个密钥一个 loader 类，复用同一个引用 */
const loaderCache = new Map<string, FragmentLoaderConstructor>();

/**
 * 按密钥拿到 fLoader 类。
 *
 * hls.js 对 `source` 做的是结构化比较，`fLoader` 的类引用必须稳定 ——
 * 每次渲染都造一个新类会让它反复拆掉重建播放引擎，所以这里按密钥缓存。
 */
export function getDecryptedFragmentLoader(rawKey: string): FragmentLoaderConstructor | undefined {
  const cached = loaderCache.get(rawKey);

  if (cached) return cached;

  const Base = BaseLoader;

  if (!Base) {
    console.warn('[player] hls.js 没有默认 loader，分片解密未启用');

    return undefined;
  }

  const DecryptedFragmentLoader = class extends Base {
    override load(
      context: FragmentLoaderContext,
      config: LoaderConfiguration,
      callbacks: LoaderCallbacks<FragmentLoaderContext>,
    ) {
      const onSuccess = callbacks.onSuccess;

      callbacks.onSuccess = async (response, stats, ctx, networkDetails) => {
        // init segment（fMP4）与分段请求不参与解密，原样放行
        if (!(response.data instanceof ArrayBuffer) || ctx.frag.sn === 'initSegment') {
          onSuccess(response, stats, ctx, networkDetails);

          return;
        }

        try {
          const cryptoKey = await getCryptoKey(rawKey);

          // 2. 提取 IV 和密文
          const iv = response.data.slice(0, 16);
          const cipherText = response.data.slice(16);

          response.data = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv },
            cryptoKey,
            cipherText,
          );
        } catch (error) {
          callbacks.onError(
            { code: 0, text: `分片解密失败：${(error as Error)?.message ?? error}` },
            ctx,
            networkDetails,
            stats,
          );

          return;
        }

        onSuccess(response, stats, ctx, networkDetails);
      };

      super.load(context, config, callbacks);
    }
  };

  loaderCache.set(rawKey, DecryptedFragmentLoader);

  return DecryptedFragmentLoader;
}
