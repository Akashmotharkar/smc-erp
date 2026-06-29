'use strict';

/*=========================================================
BLE MODULE
=========================================================*/

const BLE = (() => {

    /*=====================================================
    PRIVATE STATE
    =====================================================*/

    let device = null;

    let server = null;

    let service = null;

    let characteristic = null;

    /*=====================================================
    SEARCH DEVICE
    =====================================================*/

    async function search() {

        try {

            if (!navigator.bluetooth) {

                throw new Error(
                    'Web Bluetooth is not supported by this browser.'
                );

            }

            Logger.info('Opening BLE device picker...');

            if (isConnected()) {

                Logger.info(
                    'Disconnecting previous BLE connection...'
                );
            
                await disconnect();
            
            }
            
            device = await navigator.bluetooth.requestDevice({
            
                acceptAllDevices: true
            
            });

            if (!device) {

                Logger.warning('No device selected.');

                return;

            }

            Logger.success(
                'Selected Device : ' +
                (device.name || 'Unknown Device')
            );

            Logger.info(
                'Device ID : ' +
                device.id
            );

            Bluetooth.deviceFound(device);

        }
        catch (error) {

            Logger.error(error.message);

        }

    }

    /*=====================================================
    CONNECT
    =====================================================*/

    async function connect(selectedDevice) {

        try {

            device = selectedDevice;

            if (!device) {

                throw new Error(
                    'No BLE device selected.'
                );

            }

            Logger.info(
                'Connecting to GATT Server...'
            );

            server = await device.gatt.connect();

            Logger.success(
                'GATT Server Connected.'
            );

            device.addEventListener(
                'gattserverdisconnected',
                onDisconnected
            );

            await discoverServices();

        }
        catch (error) {

            Logger.error(error.message);

            throw error;

        }

    }

    /*=====================================================
    DISCOVER SERVICES
    =====================================================*/

    async function discoverServices() {

        Logger.info('Discovering primary services...');

        const services = await server.getPrimaryServices();

        if (!services.length) {

            throw new Error(
                'No BLE services found.'
            );

        }

        Logger.success(
            'Services Found : ' +
            services.length
        );

        characteristic = null;

        for (const svc of services) {

            Logger.info(
                'Service UUID : ' +
                svc.uuid
            );

            const characteristics =
                await svc.getCharacteristics();

            Logger.info(
                'Characteristics : ' +
                characteristics.length
            );

            for (const ch of characteristics) {

                Logger.info(
                    'Characteristic UUID : ' +
                    ch.uuid
                );

                Logger.info(
                    'Properties : ' +
                    JSON.stringify(ch.properties)
                );

                if (!characteristic &&
                    ch.properties.notify) {

                    characteristic = ch;

                    service = svc;

                    Logger.success(
                        'Notify characteristic selected.'
                    );

                }

            }

        }

        if (!characteristic) {

            throw new Error(
                'No Notify characteristic found.'
            );

        }

        await startNotifications();

    }

    /*=====================================================
    START NOTIFICATIONS
    =====================================================*/

    async function startNotifications() {

        Logger.info(
            'Starting notifications...'
        );

        await characteristic.startNotifications();

        characteristic.addEventListener(
            'characteristicvaluechanged',
            onCharacteristicChanged
        );

        Logger.success(
            'Notifications enabled.'
        );

    }

    /*=====================================================
    DATA RECEIVED
    =====================================================*/

    function onCharacteristicChanged(event) {

        try {

            const value = event.target.value;

            const bytes = new Uint8Array(
                value.buffer
            );

            Bluetooth.packetReceived(bytes);

        }
        catch (error) {

            Logger.error(
                'BLE receive failed.'
            );

            Logger.error(error.message);

        }

    }

    /*=====================================================
    DISCONNECT
    =====================================================*/

    async function disconnect() {

        try {

            if (!device) {

                Logger.warning(
                    'No BLE device available.'
                );

                return;

            }

            Logger.info(
                'Disconnecting BLE device...'
            );

            if (characteristic) {

                try {

                    characteristic.removeEventListener(
                        'characteristicvaluechanged',
                        onCharacteristicChanged
                    );

                    await characteristic.stopNotifications();

                    Logger.info(
                        'Notifications stopped.'
                    );

                }
                catch (error) {

                    Logger.warning(
                        'Unable to stop notifications.'
                    );

                }

            }

            if (device.gatt &&
                device.gatt.connected) {

                device.gatt.disconnect();

                Logger.success(
                    'GATT disconnected.'
                );

            }

            cleanup();

        }
        catch (error) {

            Logger.error(error.message);

            cleanup();

            throw error;

        }

    }

    /*=====================================================
    DEVICE DISCONNECTED
    =====================================================*/

    function onDisconnected() {

        Logger.warning(
            'BLE device disconnected.'
        );

        cleanup();

        AppCallbacks.onDeviceDisconnected();

    }

    /*=====================================================
    CLEANUP
    =====================================================*/

    function cleanup() {

        characteristic = null;

        service = null;

        server = null;

    }

    /*=====================================================
    CONNECTION STATUS
    =====================================================*/

    function isConnected() {

        return !!(
            device &&
            device.gatt &&
            device.gatt.connected
        );

    }

    function getDevice() {

        return device;

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        search,

        connect,

        disconnect,

        isConnected,

        getDevice

    };

})();

/*=========================================================
END OF FILE
=========================================================*/

  


  



             
