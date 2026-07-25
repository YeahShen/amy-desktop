import axios from 'axios';
import fs from 'node:fs';
import FormData from 'form-data';
import { createTrackedPromise } from './track-promise';

export function createUploadFileFn(
  url: string,
  file: fs.ReadStream,
  params?: Record<string, string | boolean>,
  fileName?: string,
) {
  return () =>
    createTrackedPromise((resolve, reject) => {
      const form = new FormData();

      form.append('file', file, { filename: fileName });

      if (params) {
        Object.entries(params).forEach(([key, value]) => form.append(key, value));
      }
    });
}
