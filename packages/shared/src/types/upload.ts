export type UploadStatus = 'pause' | 'uploading' | 'wait' | 'finish' | 'conversion' | 'transcoding';
export type ListenerType = 'status' | 'progress';

export interface UploadTaskOptions {
  id: string;
  title: string;
  filePath: string;
  size: number;
  chunkSize: number;
  createdTime: number;
  finishTime: number;
  status: UploadStatus;
  author: string;
  uploadedChunk: number[];

  transcodingPercentage?: number;
  uploadedPercent?: number;
  uploadedSize?: number;
}
