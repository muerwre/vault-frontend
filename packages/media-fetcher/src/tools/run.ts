import { spawn } from 'child_process';

export interface RunResult {
  code: number | null;
  /** stdout and stderr together, the tail only. */
  output: string;
  stdout: string;
}

/** Output kept per run; yt-dlp's useful lines are at the end. */
const MAX_OUTPUT = 64 * 1024;

const keepTail = (value: string) =>
  value.length > MAX_OUTPUT ? value.slice(-MAX_OUTPUT) : value;

/**
 * Runs a program to completion, passing each output line to `onLine`.
 * Aborting `signal` terminates it. Never rejects for a non-zero exit; the
 * caller reads `code`.
 */
export const run = (
  command: string,
  args: string[],
  options: {
    onLine?: (line: string) => void;
    signal?: AbortSignal;
    keepStdout?: boolean;
  } = {},
): Promise<RunResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      signal: options.signal,
    });
    let output = '';
    let stdout = '';
    let pending = '';

    const take = (chunk: Buffer, isStdout: boolean) => {
      const text = chunk.toString('utf8');

      output = keepTail(output + text);

      if (isStdout && options.keepStdout) {
        stdout += text;
      }

      pending += text;
      const lines = pending.split(/\r?\n|\r/);
      pending = lines.pop() ?? '';
      lines.forEach((line) => options.onLine?.(line));
    };

    child.stdout.on('data', (chunk: Buffer) => take(chunk, true));
    child.stderr.on('data', (chunk: Buffer) => take(chunk, false));

    child.on('error', (error) => {
      if (error.name === 'AbortError') {
        resolve({ code: null, output, stdout });
      } else {
        reject(error);
      }
    });

    child.on('close', (code) => {
      if (pending) {
        options.onLine?.(pending);
      }

      resolve({ code, output, stdout });
    });
  });
