export type UploadStatus =
  | 'pause'
  | 'uploading'
  | 'wait'
  | 'finish'
  | 'conversion'
  | 'transcoding'
  | 'merge'
  | 'delete'
  | 'error';
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
  author: number;
  uploadedChunk: number[] | string;

  transcodingPercentage?: number;
  uploadedPercent?: number;
  uploadedSize?: number;
}
