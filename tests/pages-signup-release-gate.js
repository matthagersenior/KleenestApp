// Release gate for the GitHub Pages account-creation path.
// The browser must be able to keep the auth modal open while interacting with signup controls.
const required = [
  'kleenest-auth-modal-hardening.js',
  'kleenest-auth-signup-controller.js',
  'kleenest-auth-provision.js',
  'kleenest-session-bridge.js'
];

if (typeof module !== 'undefined') module.exports = { required };
