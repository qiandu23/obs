const svcName = 'object-storage-browser'
const adminId = '6301e4e7-5416-4def-845e-8dce7d0ec9c7'
const adminName = 'obs-admin'
const adminPassword = '95bca9ba6442524254fbd546301d573a4692ea1e2499a8bf23fb0fbc10980fdb'
const millisecond = 1
const second = millisecond * 1000
const serverInfo = {
  protocol: process.env.SERVER_PROTOCOL ? process.env.SERVER_PROTOCOL : 'http',
  host: process.env.SERVER_HOST ? process.env.SERVER_HOST : '0.0.0.0',
  port: process.env.SERVER_PORT ? process.env.SERVER_PORT : 20000
}

serverInfo.baseUrl = `${serverInfo.protocol}://${serverInfo.host}:${serverInfo.port}`

module.exports = {
  svcName, serverInfo, millisecond, second, adminId, adminName, adminPassword,
  jwtSecret: Buffer.from('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'),
  httpCode: {
    OK: 200,
    TemporaryDirect: 307,
    BadRequestError: 400,
    UnauthorizedError: 401,
    PaymentRequiredError: 402,
    ForbiddenError: 403,
    NotFoundError: 404,
    MethodNotAllowedError: 405,
    NotAcceptableError: 406,
    ProxyAuthenticationRequiredError: 407,
    RequestTimeoutError: 408,
    ConflictError: 409,
    GoneError: 410,
    LengthRequiredError: 411,
    PreconditionFailedError: 412,
    PayloadTooLargeError: 413,
    UriTooLongError: 414,
    UnsupportedMediaTypeError: 415,
    RangeNotSatisfiableError: 416,
    ExpectationFailedError: 417,
    ImATeapotError: 418,
    MisdirectedRequestError: 421,
    UnprocessableEntityError: 422,
    LockedError: 423,
    FailedDependencyError: 424,
    UnorderedCollectionError: 425,
    UpgradeRequiredError: 426,
    PreconditionRequiredError: 428,
    TooManyRequestsError: 429,
    RequestHeaderFieldsTooLargeError: 431,
    UnavailableForLegalReasonsError: 451,
    InternalServerError: 500,
    NotImplementedError: 501,
    BadGatewayError: 502,
    ServiceUnavailableError: 503,
    GatewayTimeoutError: 504,
    HttpVersionNotSupportedError: 505,
    VariantAlsoNegotiatesError: 506,
    InsufficientStorageError: 507,
    LoopDetectedError: 508,
    BandwidthLimitExceededError: 509,
    NotExtendedError: 510,
    NetworkAuthenticationRequiredError: 511,
  },
  requestTimeout: second * 15,
  tokenExpireTime: 20 * 60,
  dbInfo: {
    storage: `${svcName}.sqlite`
  },
  staticDirectoryList: ['', '/', '/sign-in', '/storage', '/bucket', '/404',],
  testAccount: {
    name: 'test unit',
    password: adminPassword,
    isAdmin: false,
    description: 'This is a test account.'
  },
  testStorage: {
    name: 'test storage',
    endpoint: 'http://localhost:9000',
    accessKey: 'test',
    secretKey: 'test_test',
    region:'us-east-1'
  }
}
