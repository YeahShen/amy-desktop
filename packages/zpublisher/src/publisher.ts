import { PublisherBase, type PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeListrTaskDefinition } from '@electron-forge/shared-types';
import type { PublisherBitbucketConfig } from './config.ts';

export default class PublisherBitbucket extends PublisherBase<PublisherBitbucketConfig> {
  name: string = 'amybucket';

  async publish({
    makeResults,
    setStatusLine,
  }: PublisherOptions): Promise<ForgeListrTaskDefinition[] | void> {}
}
