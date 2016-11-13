/*global BLEDevice BLEService BLECharacteristic DigitalOut */
var blink = require('./blink.js');

// === Initiate the Bluetooth stack ===
var ble = new BLEDevice();

// === Battery Level Service ===
var batteryLevel = 100;

var batteryServiceUuid = '180f';
var batteryCharUuid = '2a19';
// BLECharacteristic takes: char UUID (16 bit), permissions (read/notify/write), size of characteristic (bytes)
var batteryChar = new BLECharacteristic(batteryCharUuid, [ 'read', 'notify' ], 1);
// BLEService takes: service UUID (16 bit), array of characteristics
var batteryService = new BLEService(batteryServiceUuid, [ batteryChar ]);

// === LED Control service ===
var controlLed = new DigitalOut(LED1);

var ledChar = new BLECharacteristic('9871', ['read', 'write'], 1);
var btnChar = new BLECharacteristic('9872', ['read', 'notify'], 1);
var ledService = new BLEService('9870', [ledChar, btnChar]);

// This function gets invoked whenever someone writes to the characteristic over GATT
ledChar.onUpdate(function(newValue) {
    print('Updated ledChar, newValue is ' + (newValue[0] ? 'on' : 'off'));
    controlLed.write(newValue[0] ? 0 : 1);
});

// === Interrupt test ===
var btn = new InterruptIn(D4);
btn.fall(function() {
  btnChar.write([1]);
});
btn.rise(function() {
  btnChar.write([0]);
});

// === BLE callbacks ===
ble.onConnection(function() {
    print('GATT connected');
});

ble.onDisconnection(function() {
    print('GATT disconnected');

    ble.startAdvertising();
});

ble.ready(function() {
    print('ble stack ready');

    ble.addServices([
        batteryService,
        ledService
    ]);
    // startAdvertising takes: name, array of services, optional advertising interval (default 1000 ms.)
    ble.startAdvertising('Battery Device', [
        batteryService.getUUID(),
        ledService.getUUID()
    ], 500);

    // built-in LED on nRF52 is 0=on, 1=off
    ledChar.write([ controlLed.read() ? 0 : 1 ]);
});

// === Application code ===
setInterval(function() {
    blink();

    // When a GATT connection is active, write to the battery level characteristic
    if (ble.isConnected()) {
        batteryChar.write([ batteryLevel ]);

        batteryLevel--;
        if (batteryLevel == 0) {
            batteryLevel = 100;
        }
    }
}, 1000);

print('main.js has finished executing.');
