import { createServer as createHttpServer, type Server } from 'http';
import {
  connect,
  createServer as createTcpServer,
  type Server as TcpServer,
} from 'net';

import { fetch } from 'undici';

import { parseProxyUrl } from './telegram.proxy';
import { socksDispatcher } from './telegram.transport';

/**
 * A minimal SOCKS5 server supporting no-auth CONNECT, so the tunnelling code
 * can be exercised against a real handshake rather than a mock.
 */
const startSocksServer = (): Promise<{
  port: number;
  connections: string[];
  close: () => Promise<void>;
}> =>
  new Promise((resolve) => {
    const connections: string[] = [];

    const server: TcpServer = createTcpServer((client) => {
      let stage: 'greeting' | 'request' | 'piping' = 'greeting';

      client.on('data', (data) => {
        if (stage === 'greeting') {
          // VER=5, NMETHODS, METHODS… → reply "version 5, no auth".
          client.write(Buffer.from([0x05, 0x00]));
          stage = 'request';
          return;
        }

        if (stage !== 'request') {
          return;
        }

        // VER CMD RSV ATYP ...
        const addressType = data[3];
        let host: string;
        let offset: number;

        if (addressType === 0x01) {
          host = `${data[4]}.${data[5]}.${data[6]}.${data[7]}`;
          offset = 8;
        } else {
          const length = data[4];
          host = data.subarray(5, 5 + length).toString('utf8');
          offset = 5 + length;
        }

        const port = data.readUInt16BE(offset);
        connections.push(`${host}:${port}`);

        const upstream = connect({ host, port }, () => {
          // Success, bound to 0.0.0.0:0 — the client does not use this address.
          client.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]));
          stage = 'piping';
          upstream.pipe(client);
          client.pipe(upstream);
        });

        upstream.on('error', () => {
          client.write(Buffer.from([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0]));
          client.end();
        });
      });

      client.on('error', () => undefined);
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };

      resolve({
        port,
        connections,
        close: () =>
          new Promise<void>((done) => {
            server.close(() => done());
          }),
      });
    });
  });

const startOriginServer = (): Promise<{
  port: number;
  close: () => Promise<void>;
}> =>
  new Promise((resolve) => {
    const server: Server = createHttpServer((request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ ok: true, seen: request.url }));
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };

      resolve({
        port,
        close: () =>
          new Promise<void>((done) => {
            server.close(() => done());
          }),
      });
    });
  });

describe('socks tunnelling (real handshake)', () => {
  let socks: Awaited<ReturnType<typeof startSocksServer>>;
  let origin: Awaited<ReturnType<typeof startOriginServer>>;

  beforeAll(async () => {
    socks = await startSocksServer();
    origin = await startOriginServer();
  });

  afterAll(async () => {
    await socks.close();
    await origin.close();
  });

  it('reaches the origin through the proxy', async () => {
    const proxy = parseProxyUrl(`socks5://127.0.0.1:${socks.port}`);
    const dispatcher = socksDispatcher(proxy!);

    const response = await fetch(
      `http://127.0.0.1:${origin.port}/bot123/getMe`,
      {
        dispatcher,
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      seen: '/bot123/getMe',
    });

    await dispatcher.close();
  });

  /** The proxy must be asked for the destination, not bypassed. */
  it('routes the destination through the proxy rather than direct', async () => {
    const proxy = parseProxyUrl(`socks5://127.0.0.1:${socks.port}`);
    const dispatcher = socksDispatcher(proxy!);

    socks.connections.length = 0;
    await fetch(`http://127.0.0.1:${origin.port}/anything`, { dispatcher });

    expect(socks.connections).toEqual([`127.0.0.1:${origin.port}`]);

    await dispatcher.close();
  });

  it('surfaces a failure when the proxy is not listening', async () => {
    // Port 1 is reserved and never has a listener.
    const proxy = parseProxyUrl('socks5://127.0.0.1:1');
    const dispatcher = socksDispatcher(proxy!);

    await expect(
      fetch(`http://127.0.0.1:${origin.port}/`, { dispatcher }),
    ).rejects.toThrow();

    await dispatcher.close();
  });
});
