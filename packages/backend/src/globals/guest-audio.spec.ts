import { stripAudioUrls } from './guest-audio';

const audio = (id: number) => ({
  id,
  type: 'audio',
  url: `/static/s${id}.mp3`,
  path: `s${id}.mp3`,
  mime: 'audio/mpeg',
  metadata: { title: `t${id}` },
});

const image = {
  id: 9,
  type: 'image',
  url: '/static/p.jpg',
  mime: 'image/jpeg',
};

describe('stripAudioUrls', () => {
  it('empties the address of audio files wherever they sit', () => {
    const body = {
      node: {
        files: [audio(1), image],
        blocks: [{ type: 'audio', files: [audio(2)] }],
      },
      after: [{ id: 5, type: 'audio', songs: [audio(3)] }],
    };

    const stripped = stripAudioUrls(body);

    expect(stripped.node.files[0]).toMatchObject({ url: '', path: '' });
    expect(stripped.node.files[0]).toMatchObject({ metadata: { title: 't1' } });
    expect(stripped.node.blocks[0].files[0].url).toBe('');
    expect(stripped.after[0].songs[0].url).toBe('');
  });

  it('leaves other files, and things that only look typed, alone', () => {
    const body = {
      files: [image],
      // a block or a node of type audio is not a file: no url, no mime
      block: { type: 'audio', files: [] as unknown[] },
      node: { id: 5, type: 'audio', title: 'x' },
    };

    expect(stripAudioUrls(body)).toBe(body);
  });

  it('copies instead of changing what it was given', () => {
    const file = audio(1);
    const body = { files: [file] };

    const stripped = stripAudioUrls(body);

    expect(stripped).not.toBe(body);
    expect(file.url).toBe('/static/s1.mp3');
    expect(body.files[0]).toBe(file);
  });

  it('passes through values that are not plain data', () => {
    const date = new Date();

    expect(stripAudioUrls(date)).toBe(date);
    expect(stripAudioUrls(null)).toBeNull();
    expect(stripAudioUrls('x')).toBe('x');
  });
});
