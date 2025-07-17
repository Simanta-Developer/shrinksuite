import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: false });

export const getVideoDuration = async (file: File): Promise<number | undefined> => {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const inputName = 'input.mp4';
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    let stderrLogs = '';
    ffmpeg.setLogger(({ type, message }) => {
      if (type === 'fferr') stderrLogs += message + '\n';
    });

    try {
      await ffmpeg.run('-i', inputName);
    } catch {
      // Expected failure, just capturing logs
    }

    const match = stderrLogs.match(/Duration:\s(\d+):(\d+):([\d.]+)/);
    if (match) {
      const [, hh, mm, ss] = match;
      return +hh * 3600 + +mm * 60 + +ss;
    }

    return undefined;
  };