'use strict';

/*=========================================================
GLOBAL APPLICATION STATE
=========================================================*/

const App = {

    version: '1.0.0',

    initialized: false,

    connectionType: 'ble',

    connected: false,

    currentSample: {

        fat: '',

        snf: '',

        clr: '',

        device: '',

        receivedTime: ''

    }

};

/*=========================================================
APPLICATION START
=========================================================*/

document.addEventListener('DOMContentLoaded', initializeApp);

/*=========================================================
INITIALIZATION
=========================================================*/

async function initializeApp() {

    Logger.info('Application started.');

    try {

        UI.cacheElements();

        Logger.success('UI elements cached.');

        UI.bindEvents();

        Logger.success('UI events registered.');

        Settings.load();

        Logger.success('Settings loaded.');

        UI.setVersion(App.version);

        await refreshSystemStatus();

        UI.clearValues();

        UI.clearRawData();

        Logger.success('Application initialized successfully.');

        App.initialized = true;

    }

    catch (error) {

        Logger.error('Application initialization failed.');

        Logger.error(error.message);

    }

}

/*=========================================================
SYSTEM STATUS
=========================================================*/

async function refreshSystemStatus() {

    Logger.info('Refreshing system status...');

    UI.showLoading('Checking browser...');

    try {

        UI.updateBrowserStatus();

        UI.updateHttpsStatus();

        UI.updateBluetoothSupport();

        UI.updateSerialSupport();

        UI.updateConnectionStatus(App.connected);

        Logger.success('Status refresh complete.');

    }

    catch (error) {

        Logger.error(error.message);

    }

    finally {

        UI.hideLoading();

    }

}

/*=========================================================
BUTTON HANDLERS
=========================================================*/

async function handleSearchDevices() {

    Logger.info('Search requested.');

    UI.clearDeviceList();

    Bluetooth.search();

}

async function handleConnect() {

    Logger.info('Connect requested.');

    Bluetooth.connect();

}

async function handleDisconnect() {

    Logger.info('Disconnect requested.');

    Bluetooth.disconnect();

}

async function handleRefreshStatus() {

    await refreshSystemStatus();

}

function handleClearValues() {

    Logger.info('Values cleared.');

    UI.clearValues();

}

function handleClearRawData() {

    Logger.info('Raw data cleared.');

    UI.clearRawData();

}

function handleClearLog() {

    Logger.clear();

}

/*=========================================================
CONNECTION CALLBACKS
=========================================================*/

function onDeviceDiscovered(device) {

    Logger.success('Device found: ' + device.name);

    UI.addDevice(device);

}

function onDeviceConnected(device) {

    App.connected = true;

    UI.updateConnectionStatus(true);

    UI.setConnectedDevice(device.name || 'Unknown Device');

    Logger.success('Connected to ' + (device.name || 'Unknown Device'));

}

function onDeviceDisconnected() {

    App.connected = false;

    UI.updateConnectionStatus(false);

    UI.setConnectedDevice('');

    Logger.warning('Device disconnected.');

}

/*=========================================================
PARSER CALLBACK
=========================================================*/

function onParsedData(result) {

    Logger.parser('Packet parsed successfully.');

    App.currentSample = {

        fat: result.fat,

        snf: result.snf,

        clr: result.clr,

        device: result.device || '',

        receivedTime: result.timestamp || ''

    };

    UI.setFat(result.fat);

    UI.setSnf(result.snf);

    UI.setClr(result.clr);

    UI.setReceivedTime(result.timestamp || '');

    Logger.success(
        'FAT=' + result.fat +
        '  SNF=' + result.snf +
        '  CLR=' + result.clr
    );

}

/*=========================================================
SAVE SAMPLE
=========================================================*/

async function handleSaveSample() {

    try {

        if (!App.currentSample.fat &&
            !App.currentSample.snf &&
            !App.currentSample.clr) {

            Logger.warning('Nothing to save.');

            return;

        }

        UI.showLoading('Saving sample...');

        const sample = {

            sampleNo: UI.getSampleNumber(),

            fat: App.currentSample.fat,

            snf: App.currentSample.snf,

            clr: App.currentSample.clr,

            device: App.currentSample.device,

            receivedTime: App.currentSample.receivedTime,

            rawData: UI.getRawData()

        };

        Logger.api('Sending sample to API...');

        const response = await API.saveSample(sample);

        if (response.success) {

            Logger.success('Sample saved successfully.');

        }
        else {

            Logger.error(response.message || 'Save failed.');

        }

    }
    catch (error) {

        Logger.error(error.message);

    }
    finally {

        UI.hideLoading();

    }

}

/*=========================================================
CONNECTION TYPE
=========================================================*/

function handleConnectionTypeChange(type) {

    App.connectionType = type;

    Logger.info('Connection type changed to: ' + type.toUpperCase());

    UI.clearDeviceList();

    UI.updateConnectionStatus(false);

}

/*=========================================================
GLOBAL CALLBACKS
Used by Bluetooth, BLE, Serial and Parser modules
=========================================================*/

window.AppCallbacks = {

    onDeviceDiscovered,

    onDeviceConnected,

    onDeviceDisconnected,

    onParsedData

};

/*=========================================================
GLOBAL BUTTON HANDLERS
=========================================================*/

window.AppActions = {

    handleSearchDevices,

    handleConnect,

    handleDisconnect,

    handleRefreshStatus,

    handleSaveSample,

    handleClearValues,

    handleClearRawData,

    handleClearLog,

    handleConnectionTypeChange

};

/*=========================================================
GLOBAL ERROR HANDLING
=========================================================*/

window.addEventListener('error', event => {

    Logger.error(
        'Unhandled Error: ' +
        event.message
    );

});

window.addEventListener('unhandledrejection', event => {

    let message = 'Unknown Promise Error';

    if (event.reason) {

        if (event.reason.message) {

            message = event.reason.message;

        } else {

            message = String(event.reason);

        }

    }

    Logger.error(
        'Unhandled Promise: ' +
        message
    );

});

/*=========================================================
PAGE VISIBILITY
=========================================================*/

document.addEventListener('visibilitychange', () => {

    if (document.hidden) {

        Logger.info('Application moved to background.');

    }
    else {

        Logger.info('Application returned to foreground.');

        refreshSystemStatus();

    }

});

/*=========================================================
ONLINE / OFFLINE
=========================================================*/

window.addEventListener('online', () => {

    Logger.success('Internet connection restored.');

});

window.addEventListener('offline', () => {

    Logger.warning('Internet connection lost.');

});

/*=========================================================
END OF FILE
=========================================================*/
