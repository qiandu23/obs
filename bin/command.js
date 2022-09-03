const {Command} = require('commander')
const Logger = require('../src/common/logger')
const Server = require('../src/server/server')
const {encrypt} = require('../src/common/utils')
const program = new Command()

program
  .command('start-api')
  .description('start object storage browser api server')
  .action(startServer.bind(program))

program
  .command('encrypt')
  .description('encrypt data')
  .option('-s, --string <data>', 'the data to encrypt')
  .action(encryptData.bind(program))


function startServer() {
  const logger = new Logger()
  const server = new Server({logger})
  server.start(err => {
    if (err) {
      logger.warn(`start server error: ${err.message}`)
    }
  })
}

function encryptData(params) {
  if (!params.string) {
    return program.help()
  }

  return console.info(encrypt(params.string))
}

function main() {
  program.parse(process.argv)

  if (process.argv.length < 3) {
    return program.help()
  }
}

/**
 * main entry
 */
main()
