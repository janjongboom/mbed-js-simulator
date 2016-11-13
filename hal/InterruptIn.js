window.InterruptIn = function(pin, defaultValue) {
  console.log('InterruptIn created', pin, defaultValue);

  this.pin = pin;
  this.value = defaultValue || 0;

  window.addComponent(this);
};

window.InterruptIn.prototype.fall = function(callback) {
  this.fallCallback = callback;
};

window.InterruptIn.prototype.rise = function(callback) {
  this.riseCallback = callback;
};

window.InterruptIn.prototype.render = function() {
  var el = this.el = document.createElement('div');
  el.innerHTML = `
    <div class="description"></div>
    <div class="buttons"></div>
  `;
  
  var fallBtn = document.createElement('button');
  fallBtn.textContent = 'Fall';
  fallBtn.onclick = () => {
    this.value = 0;
    this.rerender();
    this.fallCallback();
  };
  
  var riseBtn = document.createElement('button');
  riseBtn.textContent = 'Rise';
  riseBtn.onclick = () => {
    this.value = 1;
    this.rerender();
    this.riseCallback();
  };
  
  el.querySelector('.buttons').appendChild(fallBtn);
  el.querySelector('.buttons').appendChild(riseBtn);
  
  this.rerender();
  return el;
};

window.InterruptIn.prototype.rerender = function() {
  this.el.querySelector('.description').innerHTML = `Pin ${this.pin} (InterruptIn) - <span class="value">${this.value}</span>`;
};
