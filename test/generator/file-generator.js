const Logger = require('../../src/common/logger')
const FileGenerator = require('../../src/generator/file-generator')

describe('file generator function test', function () {
  let logger, fileGenerator
  beforeEach(function () {
    logger = new Logger()
    fileGenerator = new FileGenerator({
      logger
    })
  })

  it('generate 5GB.txt file', function (done) {
    this.timeout(0)
    fileGenerator.generateRandomFile(5, 'GB', '5GB.txt',
      err =>
        done(err))
  })
})
