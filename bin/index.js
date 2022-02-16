#!/usr/bin/env node
const program = require('commander')
const pkg = require('../package.json')
const { createServer } = require('../dist/server')

program.version(pkg.version, '-v, --version')

program
  .command('start [dir]')
  .description('start dev server')
  .option('-p, --port <port>', 'server port')
  .option('-w, --watch', 'watch reload')
  .action(createServer)

program.on('command:*', () => {
  console.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' '),
  )
  process.exit(1)
})

program.parse(process.argv)
if (process.argv.length === 2) {
  program.outputHelp()
}
