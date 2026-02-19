import { Logger } from '@nestjs/common';

process.env.NODE_ENV = 'test';
Logger.overrideLogger(false);

const noop = () => undefined;

jest.spyOn(console, 'log').mockImplementation(noop);
jest.spyOn(console, 'info').mockImplementation(noop);
jest.spyOn(console, 'warn').mockImplementation(noop);
jest.spyOn(console, 'error').mockImplementation(noop);

jest.spyOn(Logger.prototype, 'log').mockImplementation(noop);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(noop);
jest.spyOn(Logger.prototype, 'error').mockImplementation(noop);
jest.spyOn(Logger.prototype, 'debug').mockImplementation(noop);
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(noop);

jest.spyOn(Logger, 'log').mockImplementation(noop);
jest.spyOn(Logger, 'warn').mockImplementation(noop);
jest.spyOn(Logger, 'error').mockImplementation(noop);
jest.spyOn(Logger, 'debug').mockImplementation(noop);
jest.spyOn(Logger, 'verbose').mockImplementation(noop);
