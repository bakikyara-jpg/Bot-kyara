import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execFileAsync = promisify(execFile);

function cleanName(name = 'audio') {
  return String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'audio';
}

function isYouTubeUrl(value = '') {
  return /(?:youtube\.com|youtu\.be)/i.test(value);
}

async function runYtDlp(args) {
  try {
    const { stdout, stderr } = await execFileAsync('yt-dlp', args, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 10 * 60 * 1000
    });

    return {
      ok: true,
      stdout: stdout || '',
      stderr: stderr || ''
    };
  } catch (error) {
    return {
      ok: false,
      error
    };
  }
}

async function search(query) {
  if (!query || !String(query).trim()) {
    return {
      ok: false,
      msg: 'Digite o nome da música.'
    };
  }

  const input = String(query).trim();
  const isUrl = isYouTubeUrl(input);

  try {
    const args = [
      isUrl ? input : `ytsearch1:${input}`,
      '--dump-single-json',
      '--skip-download',
      '--no-warnings',
      '--no-playlist',
      '--extractor-args',
      'youtube:player_client=web_music'
    ];

    const result = await runYtDlp(args);

    if (!result.ok) {
      return {
        ok: false,
        msg:
          result.error?.stderr?.trim() ||
          result.error?.message ||
          'Não foi possível pesquisar no YouTube.'
      };
    }

    const parsed = JSON.parse(result.stdout);

    const video = Array.isArray(parsed?.entries)
      ? parsed.entries[0]
      : parsed;

    if (!video || !video.id) {
      return {
        ok: false,
        msg: 'Nenhum vídeo encontrado.'
      };
    }

    const seconds = Number(video.duration) || 0;

    let timestamp = video.duration_string || '';

    if (!timestamp && seconds > 0) {
      const total = Math.floor(seconds);
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const secs = total % 60;

      timestamp = hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    const url =
      video.webpage_url ||
      video.original_url ||
      `https://www.youtube.com/watch?v=${video.id}`;

    const thumbnail =
      video.thumbnail ||
      (video.id
        ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
        : '');

    return {
      ok: true,
      data: {
        videoId: video.id || '',
        url,
        title: video.title || 'Sem título',
        description: video.description || '',
        thumbnail,
        seconds,
        timestamp: timestamp || 'Desconhecida',
        views: Number(video.view_count) || 0,
        ago: video.upload_date || '',
        author:
          video.uploader ||
          video.channel ||
          video.uploader_id ||
          'Desconhecido'
      }
    };
  } catch (error) {
    return {
      ok: false,
      msg: error.message || 'Erro ao pesquisar no YouTube.'
    };
  }
}

async function mp3(url, bitrate = 128, onProgress = null) {
  if (!url || !isYouTubeUrl(url)) {
    return {
      ok: false,
      msg: 'URL do YouTube inválida.'
    };
  }

  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'nazuna-play-')
  );

  const outputTemplate = path.join(
    tempDir,
    '%(title)s.%(ext)s'
  );

  const emitProgress = (percent, stage = 'download') => {
    if (typeof onProgress !== 'function') return;

    const value = Math.max(
      0,
      Math.min(100, Math.floor(Number(percent) || 0))
    );

    try {
      onProgress(value, stage);
    } catch {}
  };

  const runProcessWithProgress = (
    command,
    args,
    parser,
    stage
  ) => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', chunk => {
        const text = chunk.toString();
        stdout += text;

        if (typeof parser === 'function') {
          parser(text);
        }
      });

      child.stderr.on('data', chunk => {
        const text = chunk.toString();
        stderr += text;

        if (typeof parser === 'function') {
          parser(text);
        }
      });

      child.on('error', reject);

      child.on('close', code => {
        if (code === 0) {
          resolve({
            stdout,
            stderr
          });
        } else {
          reject(
            new Error(
              stderr.trim() ||
              `Processo ${command} terminou com código ${code}.`
            )
          );
        }
      });
    });
  };

  try {
    /*
     * ========================================================
     * ETAPA 1 — DOWNLOAD REAL DO YT-DLP
     *
     * O yt-dlp fornece a porcentagem verdadeira do download.
     *
     * O download ocupa 0% → 70% do progresso geral.
     *
     * Exemplo:
     * 1%, 2%, 3%, ... 68%, 69%, 70%
     * ========================================================
     */

    let lastDownloadPercent = -1;

    const downloadParser = text => {
      /*
       * Formato típico do yt-dlp:
       *
       * [download]   1.2% ...
       * [download]  37.5% ...
       * [download] 100% ...
       */

      const matches = [
        ...text.matchAll(/\[download\]\s+(\d+(?:\.\d+)?)%/g)
      ];

      for (const match of matches) {
        const raw = Number(match[1]);

        if (!Number.isFinite(raw)) continue;

        const downloadPercent = Math.max(
          0,
          Math.min(100, raw)
        );

        const overall = Math.min(
          70,
          Math.floor(downloadPercent * 0.70)
        );

        if (overall !== lastDownloadPercent) {
          lastDownloadPercent = overall;
          emitProgress(overall, 'download');
        }
      }
    };

    await runProcessWithProgress(
      'yt-dlp',
      [
        url,
        '--no-playlist',
        '--no-warnings',
        '--newline',
        '--progress',
        '--progress-template',
        '%(progress._percent_str)s',
        '--extractor-args',
        'youtube:player_client=web_music',
        '-f',
        '18',
        '-o',
        outputTemplate
      ],
      downloadParser,
      'download'
    );

    /*
     * O download terminou.
     * Garantimos 70%, mas somente agora que o yt-dlp realmente
     * terminou o download.
     */
    emitProgress(70, 'download');

    /*
     * ========================================================
     * LOCALIZAR ARQUIVO
     * ========================================================
     */

    const files = fs.readdirSync(tempDir);

    const videoFile = files.find(file =>
      /\.(mp4|m4a|webm)$/i.test(file)
    );

    if (!videoFile) {
      throw new Error(
        'O yt-dlp terminou, mas nenhum arquivo de mídia foi encontrado.'
      );
    }

    const inputFile = path.join(tempDir, videoFile);

    const title = path
      .basename(
        videoFile,
        path.extname(videoFile)
      )
      .replace(/_/g, ' ')
      .trim();

    const outputMp3 = path.join(
      tempDir,
      `${cleanName(title)}.mp3`
    );

    /*
     * ========================================================
     * DESCOBRIR DURAÇÃO PARA O FFMPEG
     * ========================================================
     */

    let durationSeconds = 0;

    try {
      const probe = await execFileAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          inputFile
        ],
        {
          maxBuffer: 5 * 1024 * 1024,
          timeout: 60 * 1000
        }
      );

      durationSeconds = Number(
        String(probe.stdout || '').trim()
      ) || 0;
    } catch {}

    /*
     * ========================================================
     * ETAPA 2 — CONVERSÃO REAL DO FFMPEG
     *
     * O ffmpeg informa o tempo processado.
     *
     * A conversão ocupa 70% → 100% do progresso geral.
     *
     * ========================================================
     */

    let lastConversionPercent = 70;

    const ffmpegParser = text => {
      /*
       * ffmpeg -progress fornece:
       *
       * out_time_us=...
       * out_time_ms=...
       * out_time=00:00:03.000000
       */

      const usMatches = [
        ...text.matchAll(/out_time_us=(\d+)/g)
      ];

      for (const match of usMatches) {
        if (!durationSeconds) continue;

        const microseconds = Number(match[1]);

        if (!Number.isFinite(microseconds)) continue;

        const processedSeconds =
          microseconds / 1000000;

        const conversionPercent = Math.max(
          0,
          Math.min(
            100,
            (processedSeconds / durationSeconds) * 100
          )
        );

        const overall = Math.max(
          70,
          Math.min(
            99,
            70 + Math.floor(conversionPercent * 0.30)
          )
        );

        if (overall !== lastConversionPercent) {
          lastConversionPercent = overall;
          emitProgress(overall, 'conversion');
        }
      }
    };

    await runProcessWithProgress(
      'ffmpeg',
      [
        '-y',
        '-i',
        inputFile,
        '-vn',
        '-codec:a',
        'libmp3lame',
        '-b:a',
        `${bitrate}k`,
        '-progress',
        'pipe:1',
        '-nostats',
        outputMp3
      ],
      ffmpegParser,
      'conversion'
    );

    /*
     * ========================================================
     * 100% SOMENTE QUANDO O FFMPEG TERMINOU
     * ========================================================
     */

    emitProgress(100, 'complete');

    /*
     * ========================================================
     * LER MP3 FINAL
     * ========================================================
     */

    const buffer = fs.readFileSync(outputMp3);

    if (!buffer.length) {
      throw new Error(
        'O arquivo MP3 ficou vazio.'
      );
    }

    return {
      ok: true,
      buffer,
      title: title || 'YouTube Audio',
      thumbnail: '',
      filename:
        `${cleanName(title || 'audio')}.mp3`
    };

  } catch (error) {
    return {
      ok: false,
      msg:
        error.message ||
        'Erro ao baixar o áudio.'
    };

  } finally {
    try {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });
    } catch {}
  }
}

async function mp4(url, quality = 360) {
  if (!url || !isYouTubeUrl(url)) {
    return {
      ok: false,
      msg: 'URL do YouTube inválida.'
    };
  }

  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'nazuna-video-')
  );

  const outputTemplate = path.join(
    tempDir,
    '%(title)s.%(ext)s'
  );

  try {
    const result = await runYtDlp([
      url,
      '--no-playlist',
      '--no-warnings',
      '--extractor-args',
      'youtube:player_client=web_music',
      '-f',
      `18`,
      '-o',
      outputTemplate
    ]);

    if (!result.ok) {
      throw new Error(
        result.error?.stderr?.trim() ||
        result.error?.message ||
        'Falha no yt-dlp.'
      );
    }

    const files = fs.readdirSync(tempDir);

    const videoFile = files.find(file =>
      /\.mp4$/i.test(file)
    );

    if (!videoFile) {
      throw new Error(
        'O yt-dlp terminou, mas nenhum MP4 foi encontrado.'
      );
    }

    const filePath = path.join(tempDir, videoFile);
    const buffer = fs.readFileSync(filePath);

    if (!buffer.length) {
      throw new Error('O arquivo MP4 ficou vazio.');
    }

    const title = path.basename(
      videoFile,
      path.extname(videoFile)
    );

    return {
      ok: true,
      buffer,
      title,
      thumbnail: '',
      filename: `${cleanName(title)}.mp4`
    };

  } catch (error) {
    return {
      ok: false,
      msg: error.message || 'Erro ao baixar o vídeo.'
    };

  } finally {
    try {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });
    } catch {}
  }
}

export {
  search,
  mp3,
  mp4
};

export const ytmp3 = mp3;
export const ytmp4 = mp4;
