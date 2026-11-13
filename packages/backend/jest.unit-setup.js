/* eslint-disable @typescript-eslint/no-var-requires -- plain CommonJS jest setup */
/**
 * Unit specs simulate failures (a YouTube quota error, a database that refuses a
 * write) and the services log them as they would in production. Silenced here,
 * so a passing run does not read like a broken one. Assert on behaviour, or spy
 * on the logger where a spec cares about the message.
 */
const { Logger } = require('@nestjs/common');

Logger.overrideLogger(false);
