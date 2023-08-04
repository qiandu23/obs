const Logger=require('../../src/common/logger')

describe('logger function test', function () {
  let logger
  beforeEach(function () {
    logger = new Logger()
  })

  it('output logger with different levels', function () {
    logger.debug('this is a debug log')
    logger.info('this is a info log')
    logger.warn('this is a warn log')
    logger.error(new Error('this is a debug log'))
  })
})
