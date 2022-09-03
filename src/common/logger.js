const pino = require('pino')
const moment = require('moment-timezone')
const constants = require('./constants')


/**
 * Logger
 * @param options - options
 * @returns {Logger}
 * @constructor
 */
class Logger {
  constructor() {
    this._logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'debug'
    this._stdLogger = pino(
      {
        level: this._logLevel,
        formatters: {
          level(label) {
            return {level: label}
          }
        },
        base: {
          logger: constants.svcName,
          pid: process.pid,
        },
        timestamp: () => {
          return `,"time":"${moment().toISOString()}"`
        },
      },
      pino.destination())
  }

  info(...message) {
    this._stdLogger.info(...message)
  }

  debug(...message) {
    this._stdLogger.debug(...message)
  }

  warn(...message) {
    this._stdLogger.warn(...message)
  }

  error(...message) {
    this._stdLogger.error(...message)
  }
}

module.exports = Logger
