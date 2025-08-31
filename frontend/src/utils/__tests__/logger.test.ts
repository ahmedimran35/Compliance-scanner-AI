// Mock console methods
const originalConsole = { ...console }
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

describe('Logger Utility', () => {
  beforeEach(() => {
    // Replace console methods with mocks
    Object.assign(console, mockConsole)
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore original console methods
    Object.assign(console, originalConsole)
  })

  describe('in development environment', () => {
    const originalNodeEnv = process.env.NODE_ENV
    let logger: any

    beforeAll(() => {
      process.env.NODE_ENV = 'development'
      // Force reload the logger module to pick up the new environment
      jest.resetModules()
      logger = require('../logger').logger
    })

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv
      jest.resetModules()
    })

    it('logs messages when logger.log is called', () => {
      logger.log('test message')
      expect(console.log).toHaveBeenCalledWith('test message')
    })

    it('logs errors when logger.error is called', () => {
      logger.error('test error')
      expect(console.error).toHaveBeenCalledWith('test error')
    })

    it('logs warnings when logger.warn is called', () => {
      logger.warn('test warning')
      expect(console.warn).toHaveBeenCalledWith('test warning')
    })

    it('logs info when logger.info is called', () => {
      logger.info('test info')
      expect(console.info).toHaveBeenCalledWith('test info')
    })

    it('logs debug when logger.debug is called', () => {
      logger.debug('test debug')
      expect(console.debug).toHaveBeenCalledWith('test debug')
    })

    it('handles multiple arguments', () => {
      logger.log('message', { data: 'test' }, 123)
      expect(console.log).toHaveBeenCalledWith('message', { data: 'test' }, 123)
    })
  })

  describe('in production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV
    let logger: any

    beforeAll(() => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      logger = require('../logger').logger
    })

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv
      jest.resetModules()
    })

    it('does not log messages when logger.log is called', () => {
      logger.log('test message')
      expect(console.log).not.toHaveBeenCalled()
    })

    it('does not log errors when logger.error is called', () => {
      logger.error('test error')
      expect(console.error).not.toHaveBeenCalled()
    })

    it('does not log warnings when logger.warn is called', () => {
      logger.warn('test warning')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('does not log info when logger.info is called', () => {
      logger.info('test info')
      expect(console.info).not.toHaveBeenCalled()
    })

    it('does not log debug when logger.debug is called', () => {
      logger.debug('test debug')
      expect(console.debug).not.toHaveBeenCalled()
    })
  })

  describe('default export', () => {
    it('exports logger as default', () => {
      const defaultLogger = require('../logger').default
      const loggerModule = require('../logger').logger
      expect(defaultLogger).toBe(loggerModule)
    })
  })
})
