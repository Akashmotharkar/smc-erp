'use strict';

/*=========================================================
BLUETOOTH CONTROLLER
=========================================================*/

const Bluetooth = (() => {

    /*=====================================================
    PRIVATE STATE
    =====================================================*/

    let currentDevice = null;

    let connected = false;

    let mode = 'ble';

    /*=====================================================
    SEARCH
    =====================================================*/

    async function search() {

        try {

            mode = App.connectionType;

            Logger.info('Search started.');

            UI.setSearchingStatus();

            if (mode === 'ble') {

                Logger.info('Searching BLE devices...');

                await BLE.search();

            }
            else {

                Logger.info('Searching Serial Bluetooth devices...');

                await Serial.search();

            }

        }
        catch (error) {

            Logger.error(error.message);

            UI.updateConnectionStatus(false);

        }

    }

    /*=====================================================
    CONNECT
    =====================================================*/

    async function connect() {

        try {

            const device = UI.getSelectedDevice();

            if (!device) {

                Logger.warning('Please select a device.');

                return;

            }

            currentDevice = device;

            Logger.info(
                'Connecting to: ' +
                (currentDevice.name || 'Unknown Device')
            );

            if (mode === 'ble') {

                await BLE.connect(currentDevice);

            }
            else {

                await Serial.connect(currentDevice);

            }

            connected = true;

            AppCallbacks.onDeviceConnected(currentDevice);

        }
        catch (error) {

            connected = false;

            currentDevice = null;

            Logger.error(error.message);

            AppCallbacks.onDeviceDisconnected();

        }

    }

    /*=====================================================
    DISCONNECT
    =====================================================*/

    async function disconnect() {

        try {

            if (!connected) {

                Logger.warning('No active connection.');

                return;

            }

            Logger.info('Disconnect requested.');

            if (mode === 'ble') {

                await BLE.disconnect();

            }
            else {

                await Serial.disconnect();

            }

            connected = false;

            currentDevice = null;

            AppCallbacks.onDeviceDisconnected();

        }
        catch (error) {

            Logger.error(error.message);

        }

    }

    /*=====================================================
    DEVICE DISCOVERY CALLBACK
    Called by BLE / Serial modules
    =====================================================*/

    function deviceFound(device) {

        if (!device) {

            Logger.warning('Invalid device discovered.');

            return;

        }

        Logger.success(
            'Device Found : ' +
            (device.name || 'Unknown Device')
        );

        AppCallbacks.onDeviceDiscovered(device);

    }

    /*=====================================================
    RAW PACKET RECEIVED
    Called by BLE / Serial modules
    =====================================================*/

    function packetReceived(data) {

        try {

            if (data === undefined || data === null) {

                Logger.warning('Empty packet received.');

                return;

            }

            const timestamp = new Date().toLocaleTimeString(
                'en-IN',
                {
                    hour12: false,
                    fractionalSecondDigits: 3
                }
            );

            let hex = '';
            let ascii = '';

            if (data instanceof Uint8Array) {

                hex = Array.from(data)
                    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                    .join(' ');

                ascii = new TextDecoder().decode(data);

            }
            else {

                ascii = String(data);

                hex = Array.from(ascii)
                    .map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
                    .join(' ');

            }

            Logger.receive(
                'Packet Received (' +
                timestamp +
                ')'
            );

            UI.appendRawData(
                '════════════════════════════'
            );

            UI.appendRawData(
                'TIME : ' + timestamp
            );

            UI.appendRawData('');

            UI.appendRawData(
                'ASCII'
            );

            UI.appendRawData(
                ascii
            );

            UI.appendRawData('');

            UI.appendRawData(
                'HEX'
            );

            UI.appendRawData(
                hex
            );

            UI.appendRawData('');


            const result = Parser.parse({

                    ascii,
                
                    hex,
                
                    bytes: data,
                
                    timestamp,
                
                    device: currentDevice
                        ? currentDevice.name
                        : ''
                
                });
                
                if (result) {
                
                    Logger.parser('Parser completed successfully.');
                
                    AppCallbacks.onParsedData(result);
                
                }
                else {
                
                    Logger.warning('Parser could not recognize packet.');
                
                }

        }
        catch (error) {

            Logger.error(
                'Packet processing failed.'
            );

            Logger.error(error.message);

        }

    }

    /*=====================================================
    CONNECTION STATE
    =====================================================*/

    function isConnected() {

        return connected;

    }

    function getCurrentDevice() {

        return currentDevice;

    }

    function getMode() {

        return mode;

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

    search,

    connect,

    disconnect,

    deviceFound,

    packetReceived,

    isConnected,

    getCurrentDevice,

    getMode

};

})();

/*=========================================================
END OF FILE
=========================================================*/                   
