import { AxiosInstance } from 'axios';
import fs from 'node:fs';
import FormData from 'form-data';
import { createTrackedPromise } from './track-promise';

export function createUploadFileFn<T>(authAxios: AxiosInstance, uri: string, fileName?: string) {
  function upload(file: fs.ReadStream, params?: Record<string, string | boolean | number>) {
    const formData = new FormData();

    formData.append('chunk', file, { filename: fileName });

    if (params) {
      Object.entries(params).forEach(([key, value]) => formData.append(key, value));
    }

    return () =>
      createTrackedPromise<T>((resolve, reject) => {
        authAxios
          .post<T>(uri, formData, {
            headers: {},
          })
          .then(({ data }) => {
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }

  return {
    uploadFn: upload,
  };
}
