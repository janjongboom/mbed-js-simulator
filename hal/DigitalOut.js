window.DigitalOut = function(pin, defaultValue) {
  console.log('DigitalOut created', pin, defaultValue);

  this.pin = pin;
  this.value = defaultValue || 0;
  this.is_connected = () => true;

  this.localStorageDisplayKey = 'do-' + pin + '-displaymode';

  window.addComponent(this);
};

window.DigitalOut.prototype.write = function(v) {
  // console.log('DigitalOut.write', this.pin, v);
  this.value = v;

  this.rerender();
};

window.DigitalOut.prototype.read = function() {
  // console.log('DigitalOut.read', this.pin, this.value);
  return this.value;
};

window.DigitalOut.prototype.render = function() {
  var el = this.el = document.createElement('div');

  el.innerHTML = `
    <p><select class="displaymode">
      <option>Raw value</option>
      <option>LED</option>
      <option>LED Inverted</option>
    </select></p>
    <div class="view"></div>
  `;

  el.querySelector('.displaymode').onchange = e => {
    this.displayMode = e.target.value;

    localStorage.setItem(this.localStorageDisplayKey, this.displayMode);

    console.log('displaymode', this.displayMode);

    this.rerender();
  };

  this.displayMode = localStorage.getItem(this.localStorageDisplayKey) || 'Raw value';
  el.querySelector('.displaymode').value = this.displayMode;

  this.rerender();
  return el;
};

window.DigitalOut.prototype.rerender = function() {
  var v = this.el.querySelector('.view');

  switch (this.displayMode) {
    case 'LED':
      v.innerHTML = `
        <p>Pin ${this.pin} (DigitalOut) - <span class="value">${this.value}</span></p>
        <p><img src="/img/led.png" style="height: 50px"></p>
      `;
      if (this.value === 0) {
        v.querySelector('img').style.opacity = 0.3;
      }
      break;

    case 'LED Inverted':
      v.innerHTML = `
        <p>Pin ${this.pin} (DigitalOut) - <span class="value">${this.value}</span></p>
        <p><img src="/img/led.png" style="height: 50px"></p>
      `;
      if (this.value === 1) {
        v.querySelector('img').style.opacity = 0.3;
      }
      break;

    case 'Raw value':
    default:
      v.innerHTML = `Pin ${this.pin} (DigitalOut) - <span class="value">${this.value}</span>`;
      break;
  }
};
