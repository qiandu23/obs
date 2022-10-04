const fsExtra = require('fs-extra')
const fs = require('fs')
const async = require('async')
const utils = require('../common/utils')
const {MB} = require('../common/constants')

class FileGenerator {
  constructor(options) {
    this._logger = options.logger
  }

  generateRandomMBBlock() {
    let block = ''
    for (let i = 0; i < MB; i++) {
      block += utils.getRandomLowerCharacter()
    }

    return block
  }

  generateRandomFile(size, unit, filepath, callback) {
    const self = this
    const unitSize = utils.getUnitSize(unit)
    if (unitSize === -1) {
      return callback(new Error('size unit is not found'))
    }
    let block = utils.getRandomLowerCharacter()
    size = size * unitSize
    if (size >= MB) {
      size /= MB
      block = self.generateRandomMBBlock()
    }
    let count = 0
    fsExtra.ensureFile(filepath)
    async.whilst(
      function test(cb) {
        cb(null, count < size)
      },
      function iter(cb) {
        count++
        fs.appendFile(filepath, block, err =>
          cb(err))
      },
      function (err) {
        callback(err)
      }
    )
  }
}

module.exports = FileGenerator
