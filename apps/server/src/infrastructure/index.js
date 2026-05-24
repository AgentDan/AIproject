/** Universal infrastructure — заглушки по схеме v2 (Auth, Event bus, Jobs, Realtime, Analytics). */

export const auth = {
  /** @returns {Promise<{ userId: string | null }>} */
  async getSession() {
    return { userId: null };
  }
};

export const eventBus = {
  /** @param {string} _event @param {unknown} _payload */
  publish(_event, _payload) {}
};

export const jobs = {
  /** @param {string} _name @param {unknown} _payload */
  enqueue(_name, _payload) {}
};

export const realtime = {
  /** @param {string} _channel @param {unknown} _message */
  broadcast(_channel, _message) {}
};

export const analytics = {
  /** @param {string} _name @param {Record<string, unknown>} _props */
  track(_name, _props) {}
};
