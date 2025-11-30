type ConsoleInterface = Pick<
  Console,
  'log' | 'warn' | 'error' | 'info' | 'debug'
>

function getConsole(): ConsoleInterface {
  if (typeof window !== 'undefined') {
    return window.console
  }
  return global.console
}

const console = getConsole()

export { console }
