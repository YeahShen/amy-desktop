export type AliOssPublisherConfig = {
  notify: {
    baseUrl: string;
    username: string;
    password: string;
  };
  /** 应用名，作为对象 Key 前缀：`${appName}/${platform}/${arch}/${filename}` */
  appName: string;
  /** Bucket 所在地域，如 `oss-cn-hangzhou` */
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  packageName: string;
  /** 自定义接入点/域名，优先级高于 region */
  endpoint?: string;
  /** 是否使用 HTTPS，默认 true */
  secure?: boolean;
  /** 临时授权 token（STS） */
  stsToken?: string;
  /** 实例级超时（ms） */
  timeout?: number;
  /** 分片大小（字节），默认 1MB */
  partSize?: number;
  /** 分片并发数，默认 4 */
  parallel?: number;
};
