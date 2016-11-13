// === BLEDevice ===
window.BLEDevice = function() {
  console.log('BLEDevice created');

  this.connected = false;
  this.services = [];

  window.addComponent(this);
};

window.BLEDevice.prototype.onConnection = function(callback) {
  this.connectionCallback = callback;
};

window.BLEDevice.prototype.onDisconnection = function(callback) {
  this.disconnectionCallback = callback;
};

window.BLEDevice.prototype.ready = function(callback) {
  this.readyCallback = callback;

  setTimeout(() => this.readyCallback(), 0);
};

window.BLEDevice.prototype.isConnected = function() {
  return this.connected;
};

window.BLEDevice.prototype.addServices = function(services) {
  this.services = services;

  this.rerender();
};

window.BLEDevice.prototype.startAdvertising = function(name, uuids, interval) {
  if (name) this.advName = name;
  if (uuids) this.advUuids = uuids;
  if (interval || !this.advInterval) this.advInterval = interval || 1000;

  this.advertising = true;

  this.rerender();
};

window.BLEDevice.prototype.stopAdvertising = function() {
  this.advertising = false;
  this.rerender();
};

window.BLEDevice.prototype.render = function() {
  var el = this.el = document.createElement('div');
  this.rerender();
  return el;
};

window.BLEDevice.prototype.rerender = function() {
  if (this.connected) {
    this.el.innerHTML = `
      <p>BLE, services: [${this.services.map(s => s.getUUID()).join(', ')}]</p>
      <p>Connected</p>
      <p>Services</p>
      <div style='padding-left: 20px;' class='services'></div>
      <p><button class="disconnect">Disconnect</button>
    `;

    this.services.forEach(s => {
      this.el.querySelector('.services').appendChild(s.render());
    });

    this.el.querySelector('.disconnect').onclick = () => {
      this.advertising = false;
      this.connected = false;
      this.disconnectionCallback && this.disconnectionCallback();

      this.rerender();
    };
  }
  else if (!this.advertising && !this.connected) {
    this.el.innerHTML = `
      <p>BLE, services: [${this.services.map(s => s.getUUID()).join(', ')}]</p>
      <p>Not advertising...</p>
    `;
  }
  else if (this.advertising && !this.connected) {
    this.el.innerHTML = `
      <p>BLE, services: [${this.services.map(s => s.getUUID()).join(', ')}]</p>
      <p>Advertising...</p>
      <p>
        Name = ${this.advName}<br>
        UUIDs = [${this.advUuids.join(', ')}]<br>
        Interval = ${this.advInterval} ms.
      </p>
      <p><button class="connect">Connect</button>
    `;

    this.el.querySelector('.connect').onclick = () => {
      this.advertising = false;
      this.connected = true;
      this.connectionCallback && this.connectionCallback();

      this.rerender();
    };
  }
};

// === BLECharacteristic ===

window.BLECharacteristic = function(uuid, permissions, size) {
  console.log('BLECharacteristic created', uuid, permissions, size);
  this.uuid = uuid;
  this.permissions = permissions;
  this.size = size;

  this.value = [];
};

window.BLECharacteristic.prototype.onUpdate = function(callback) {
  this.updateCallback = callback;
};

window.BLECharacteristic.prototype.read = function() {
  return this.value;
};

window.BLECharacteristic.prototype.write = function(v) {
  this.value = v;

  this.rerender();
};

window.BLECharacteristic.prototype.getUUID = function() {
  return this.uuid;
};

window.BLECharacteristic.prototype.render = function() {
  var el = this.el = document.createElement('div');

  var v = `${this.uuid} - <span class="value"></span>`;

  if (this.permissions.indexOf('write') > -1) {
    v += ` - <button class="write">Write new value</button>`;
  }

  el.innerHTML = `<p>${v}</p>`;

  if (el.querySelector('.write')) {
    el.querySelector('.write').onclick = () => {
      var newV = prompt('New value (split bytes by ,)', '');
      if (newV !== null) {
        var data = newV.split(',').map(c => Number(c.trim()));

        this.value = data;
        this.updateCallback && this.updateCallback(this.value);
        this.rerender();
      }
    };
  }

  this.rerender();
  return el;
};

window.BLECharacteristic.prototype.rerender = function() {
  if (!this.el) return;

  this.el.querySelector('.value').textContent =
    '[' + this.value.map(c=>'0x' + c.toString(16)).join(', ') + ']';
};

// === BLEService ===

window.BLEService = function(uuid, chars) {
  console.log('BLEService created', uuid, chars);

  this.uuid = uuid;
  this.chars = chars;
};

window.BLEService.prototype.getUUID = function() {
  return this.uuid;
};

window.BLEService.prototype.render = function() {
  var el = this.el = document.createElement('div');
  el.innerHTML = `
    <p>${this.uuid}</p>
    <div style="padding-left: 20px" class="chars"></div>
  `;

  this.chars.forEach(c => {
    el.querySelector('.chars').appendChild(c.render());
  });
  return el;
};
