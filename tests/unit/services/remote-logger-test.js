import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:remote-logger', 'Unit | Service | remote logger');

test('it has a `urls` attr for the logging endpoint', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    host: 'https://example.com',
    namespace: 'api/v1'
  });

  assert.deepEqual(service.get('urls'), {
    debug: 'https://example.com/api/v1/log/debug',
    info: 'https://example.com/api/v1/log/info',
    warn: 'https://example.com/api/v1/log/warn',
    error: 'https://example.com/api/v1/log/error',
  });
});

test('`url` attr works without a host', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    namespace: 'api/v1'
  });

  assert.equal(service.get('url'), '/api/v1/log');
});

test('`url` attr works without a namespace', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    host: 'https://example.com',
  });

  assert.equal(service.get('url'), 'https://example.com/log');
});

test('`url` attr works without a host and namespace', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {});

  assert.equal(service.get('url'), '/log');
});

test('the host for the logging endpoint is customizable', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    host: 'https://example.com',
    namespace: 'api/v1'
  });

  service.set('host', 'https://example.net');

  assert.equal(service.get('url'), 'https://example.net/api/v1/log');
});

test('the namespace for the logging endpoint is customizable',
  function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    host: 'https://example.com',
    namespace: 'api/v1'
  });

  service.set('namespace', 'api/v2');

  assert.equal(service.get('url'), 'https://example.com/api/v2/log');
});

test('the `pathPrefix` for the logging endpoint is customizable', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.set('adapter', {
    host: 'https://example.com',
    namespace: 'api/v1'
  });

  service.set('pathPrefix', 'log-entries');

  assert.equal(service.get('url'), 'https://example.com/api/v1/log-entries');
});

test('it concats given tags, keeping log level tag first', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.reopen({
    _sendRequest(_opts, _level, entry) {
      assert.equal(entry, '[DEBUG] [COOL_TAG] [AND_ANOTHER_1] Cool log entry');
    }
  });

  service.debug('Cool log entry', ['COOL_TAG', 'AND_ANOTHER_1']);
});

test('it sends log entry tagged with log level', function(assert) {
  assert.expect(4);

  let service = this.subject();

  service.reopen({
    _sendRequest(_opts, _level, entry) {
      assert.equal(entry, '[DEBUG] Cool log entry');
    }
  });

  service.debug('Cool log entry');

  service.reopen({
    _sendRequest(_opts, _level, entry) {
      assert.equal(entry, '[INFO] Cool log entry');
    }
  });

  service.info('Cool log entry');

  service.reopen({
    _sendRequest(_opts, _level, entry) {
      assert.equal(entry, '[WARN] Cool log entry');
    }
  });

  service.warn('Cool log entry');

  service.reopen({
    _sendRequest(_opts, _level, entry) {
      assert.equal(entry, '[ERROR] Cool log entry');
    }
  });

  service.error('Cool log entry');
});

test('it rejects if response is not ok', function(assert) {
  assert.expect(1);

  let service = this.subject();

  service.reopen({
    _sendRequest() {
      return Ember.RSVP.reject({ ok: false });
    }
  });

  service.debug('Cool log entry').catch((r) => {
    assert.notOk(r.ok);
  });
});
