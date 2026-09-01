export type UploadStatus = 'pause' | 'uploading' | 'wait' | 'finish' | 'delete' | 'error';

export type ListenerType = 'status' | 'progress';

export interface UploadTaskOptions {
  id: string;
  title: string;
  filePath: string;
  size: number;
  chunkSize: number;
  createdTime: number;
  status: UploadStatus;
  author: number;
  uploadedChunk: number[] | string;

  finishTime?: number;
  progressRate?: number;
  uploadedSize?: number;
}
