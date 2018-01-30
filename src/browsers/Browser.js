
const utils = require('../utils')
const DO = require('deepobject')

/**
 * A base class that represents a generic browser. All browsers ({@link Chrome},
{@link Firefox}) will inherit from this class
 */
class Browser {
  /**
   * Base class for all browser objects such as {@link browsers/Chrome Chrome}, {@link Firefox Firefox} and {@link Remote Remote}
   *
   * The main aim of Browser objects is to:
   *
   *  * Run the corresponding webdriver process (e.g. `geckodriver` for Firefox, `chromedriver` for Chrome, etc.).
   *  * Provide a configuration object that will be used when creating a new session with the webdriver
   *
   *
   *  A basic (empty) session configuration object looks like this:
   *
   *        {
   *          capabilities: {
   *            alwaysMatch: {},
   *            firstMatch: []
   *          }
   *        }
   *
   * Such configuration object is especially important when you connect to a webdriver proxy, which then
   * forward your requests to the right webdriver depending on the required capabilities.
   *
   * When connecting straight to a locally launched webdriver process, the main use of the session configuraiton
   * object is the setting of browser-specific information (there would be little point in running the Chrome
   * webdriver and impose `firefox` as the `browserName`...).
   *
   * For example:
   *
   * * In Chrome, having `specific` set as `{ detach: false }` will set
   * `capabilities.alwaysMatch.chromeOptions.detach` to `false`.
   * * In Firefox, having `specific` set as `{ profile: 'tony' }` will set
   * `capabilities.alwaysMatch.moz:firefoxOptions.profile` to `tony`
   *
   * @param {Object} alwaysMatch The alwaysMatch object passed to the webdriver
   * @param {string} alwaysMatch.browserName The user agent
   * @param {string} alwaysMatch.browserVersion Identifies the version of the user agent
   * @param {string} alwaysMatch.platformName Identifies the operating system of the endpoint node
   * @param {boolean} alwaysMatch.acceptInsecureCerts Indicates whether untrusted and self-signed TLS certificates are implicitly trusted on navigation for the duration of the session
   * @param {string} alwaysMatch.pageLoadStrategy Defines the current session’s page load strategy. It can be `none`, `eager` or `normal`
   * @param {object} alwaysMatch.proxy Defines the current session’s proxy configuration. See the
                     {@link https://w3c.github.io/webdriver/webdriver-spec.html#dfn-proxy-configuration spec's
                     proxy options}
   * @param {boolean} alwaysMatch.setWindowRect Indicates whether the remote end supports all of the commands in Resizing and Positioning Windows
   * @param {object} alwaysMatch.timeouts Describes the timeouts imposed on certain session operations. Can have keys `implicit`, `pageLoad` or `script`
   * @param {string} alwaysMatch.unhandledPromptBehavior Describes the current session’s user prompt handler. It
   *                 can be: `dismiss`, `accept`, `dismiss and notify`, `accept and notify`, `ignore`

   * @param {Array} firstMatch The firstMatch array passed to the webdriver
   * @param {Object} root The keys of this object will be copied over the webdriver object
   * @param {Object} specific Specific keys for the browser
   */
  constructor (alwaysMatch = {}, firstMatch = [], root = {}, specific = {}) {
    // Sanity checks. Things can go pretty bad if these are wrong
    if (!utils.isObject(alwaysMatch)) {
      throw new Error('alwaysMatch must be an object')
    }
    if (!Array.isArray(firstMatch)) {
      throw new Error('firstmatch parameter must be an array')
    }
    if (!utils.isObject(root)) {
      throw new Error('root options must be an object')
    }

    this.sessionParameters = {
      capabilities: {
        alwaysMatch: alwaysMatch,
        firstMatch: firstMatch
      }
    }
    // Copy over whatever is specified in `root`
    for (var k in root) {
      if (root.hasOwnProperty(k)) this.sessionParameters[ k ] = root[k]
    }

    // Give it a nice, lowercase name
    this.name = 'browser'
  }

  /**
   * Method to set the `alwaysMatch` property in the browser's capabilities
   *
   * @param {string} path The name of the property to set. It can be a path; if path is has a `.` (e.g.
   *                      `something.other`), the property
   *                      `sessionParameters.capabilities.alwaysMatch.something.other` will be set
   * @param {*} value The value to assign to the property
   * @param {boolean} force It will overwrite keys if already present.
   *
   * @example
   * this.setAlwaysMatchKey('timeouts.implicit', 10000, true)
   */
  setAlwaysMatchKey (path, value, force = false) {
    var alwaysMatch = this.sessionParameters.capabilities.alwaysMatch
    if (force || typeof DO.get(alwaysMatch, path) === 'undefined') {
      DO.set(alwaysMatch, path, value)
    }
  }

  /**
   * Adds a property to the `firstMatch` array in the browser's capabilities.
   *
   * @param {string} name The name of the property to set
   * @param {*} value The value to assign
   * @param {boolean} force It will overwrite keys if needed
   *
   * @example
   * this.addFirstMatch('browserName', 'chrome')
   * this.addFirstMatch('browserName', 'firefox')
   */
  addFirstMatch (name, value, force = false) {
    if (force || !this.sessionParameters.capabilities.firstMatch.indexOf(name) === -1) {
      this.sessionParameters.capabilities.firstMatch.push({ [name]: value })
    }
  }

  /**
   * Sets a key (or a path) on the object which will be sent to the webdriver when
   * creating a session
   *
   * @param {string} path The name of the property to set. It can be a path; if path is has a `.` (e.g.
   *                      `something.other`), the property
   *                      `sessionParameters.something.other` will be set
   * @param {*} value The value to assign
   * @param {boolean} force It will overwrite keys if needed
   *
   * @example
   * this.setRootKey('login', 'blah')
   * this.setRootKey('pass', 'blah')
   */
  setRootKey (path, value, force = true) {
    if (force || typeof DO.get(this.sessionParameters, path) === 'undefined') {
      DO.set(this.sessionParameters, path, value)
    }
  }

  /**
   * Return the current session parameters. This is used by the {@link Driver#newSession} call
   * to get the parameters to be sent over
   *
   * @return {Object} The full session parameters
   *
   */
  getSessionParameters () {
    return this.sessionParameters
  }

  /**
   * Run the actual webdriver's executable, depending on the browser
   *
   * @param {Object} opt Options to configure the webdriver executable
   * @param {number} opt.port The port the webdriver executable will listen to
   * @param {Array} opt.args The arguments to pass to the webdriver executable
   * @param {Object} opt.env The environment to pass to the spawn webdriver
   * @param {string} opt.stdio The default parameter to pass to {@link https://nodejs.org/api/child_process.html#child_process_options_stdio stdio} when spawning new preocess.
   *
   */
  async run (options) {
  }
}
exports = module.exports = Browser
