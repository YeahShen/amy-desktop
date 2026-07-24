export type PublisherBitbucketConfig = {
  appName: string;
  baseUrl: string;
  replaceExist?: boolean;
  packageName: string;

  auth?: {
    username?: string;
    password?: string;
  };
};
