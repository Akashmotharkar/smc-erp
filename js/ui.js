'use strict';

/*=========================================================
UI MODULE
=========================================================*/

const UI = (() => {

    const el = {};

    /*=====================================================
    CACHE ELEMENTS
    =====================================================*/

    function cacheElements() {

        /* Header */

        el.appVersion = document.getElementById('appVersion');
        el.connectionBadge = document.getElementById('connectionBadge');

        /* Sample */

        el.fatInput = document.getElementById('fatInput');
        el.snfInput = document.getElementById('snfInput');
        el.clrInput = document.getElementById('clrInput');
        el.sampleInput = document.getElementById('sampleInput');
        el.deviceInput = document.getElementById('deviceInput');
        el.timeInput = document.getElementById('timeInput');

        /* Buttons */

        el.searchBtn = document.getElementById('searchBtn');
        el.refreshStatusBtn = document.getElementById('refreshStatusBtn');
        el.connectBtn = document.getElementById('connectBtn');
        el.disconnectBtn = document.getElementById('disconnectBtn');

        el.clearValuesBtn = document.getElementById('clearValuesBtn');
        el.saveSampleBtn = document.getElementById('saveSampleBtn');

        el.clearRawBtn = document.getElementById('clearRawBtn');

        el.clearLogBtn = document.getElementById('clearLogBtn');
        el.copyLogBtn = document.getElementById('copyLogBtn');
        el.downloadLogBtn = document.getElementById('downloadLogBtn');

        el.copyRawBtn = document.getElementById('copyRawBtn');

        /* Bluetooth */

        el.bleRadio = document.getElementById('bleRadio');
        el.serialRadio = document.getElementById('serialRadio');

        el.deviceList = document.getElementById('deviceList');

        /* Status */

        el.browserStatus = document.getElementById('browserStatus');
        el.httpsStatus = document.getElementById('httpsStatus');
        el.bleStatus = document.getElementById('bleStatus');
        el.serialStatus = document.getElementById('serialStatus');
        el.connectionStatus = document.getElementById('connectionStatus');

        /* Panels */

        el.rawDataPanel = document.getElementById('rawDataPanel');

        el.loadingOverlay = document.getElementById('loadingOverlay');
        el.loadingText = document.getElementById('loadingText');

    }

    /*=====================================================
    EVENTS
    =====================================================*/

    function bindEvents() {

        el.searchBtn.addEventListener(
            'click',
            AppActions.handleSearchDevices
        );

        el.refreshStatusBtn.addEventListener(
            'click',
            AppActions.handleRefreshStatus
        );

        el.connectBtn.addEventListener(
            'click',
            AppActions.handleConnect
        );

        el.disconnectBtn.addEventListener(
            'click',
            AppActions.handleDisconnect
        );

        el.clearValuesBtn.addEventListener(
            'click',
            AppActions.handleClearValues
        );

        el.saveSampleBtn.addEventListener(
            'click',
            AppActions.handleSaveSample
        );

        el.clearRawBtn.addEventListener(
            'click',
            AppActions.handleClearRawData
        );

        el.clearLogBtn.addEventListener(
            'click',
            AppActions.handleClearLog
        );

        el.copyLogBtn.addEventListener(
            'click',
            Logger.copy
        );

        el.downloadLogBtn.addEventListener(
            'click',
            Logger.download
        );

    }

    /*=====================================================
    REMAINING EVENTS
    =====================================================*/

        el.copyRawBtn.addEventListener(
            'click',
            copyRawData
        );

        el.bleRadio.addEventListener(
            'change',
            () => {

                if (el.bleRadio.checked) {

                    AppActions.handleConnectionTypeChange('ble');

                }

            }
        );

        el.serialRadio.addEventListener(
            'change',
            () => {

                if (el.serialRadio.checked) {

                    AppActions.handleConnectionTypeChange('serial');

                }

            }
        );

        el.deviceList.addEventListener(
            'change',
            () => {

                const index = el.deviceList.selectedIndex;

                if (index < 0) {

                    return;

                }

                el.connectBtn.disabled = false;

            }
        );

    }

    /*=====================================================
    VERSION
    =====================================================*/

    function setVersion(version) {

        el.appVersion.textContent = 'Version ' + version;

    }

    /*=====================================================
    LOADING
    =====================================================*/

    function showLoading(message = 'Please wait...') {

        el.loadingText.textContent = message;

        el.loadingOverlay.classList.remove('hidden');

    }

    function hideLoading() {

        el.loadingOverlay.classList.add('hidden');

    }

    /*=====================================================
    CONNECTION STATUS
    =====================================================*/

    function updateConnectionStatus(connected) {

        if (connected) {

            el.connectionBadge.textContent = 'Connected';

            el.connectionBadge.classList.remove('disconnected');

            el.connectionBadge.classList.remove('searching');

            el.connectionBadge.classList.add('connected');

            el.connectionStatus.textContent = 'Connected';

            el.connectBtn.disabled = true;

            el.disconnectBtn.disabled = false;

        }
        else {

            el.connectionBadge.textContent = 'Disconnected';

            el.connectionBadge.classList.remove('connected');

            el.connectionBadge.classList.remove('searching');

            el.connectionBadge.classList.add('disconnected');

            el.connectionStatus.textContent = 'Disconnected';

            el.connectBtn.disabled = true;

            el.disconnectBtn.disabled = true;

        }

    }

    function setSearchingStatus() {

        el.connectionBadge.textContent = 'Searching';

        el.connectionBadge.classList.remove('connected');

        el.connectionBadge.classList.remove('disconnected');

        el.connectionBadge.classList.add('searching');

    }

    /*=====================================================
    SYSTEM STATUS
    =====================================================*/

    function updateBrowserStatus() {

        el.browserStatus.textContent = navigator.userAgent;

    }

    function updateHttpsStatus() {

        el.httpsStatus.textContent =
            location.protocol === 'https:' ? 'Supported' : 'Not Secure';

    }

    function updateBluetoothSupport() {

        el.bleStatus.textContent =
            navigator.bluetooth ? 'Supported' : 'Not Supported';

    }

    function updateSerialSupport() {

        el.serialStatus.textContent =
            ('serial' in navigator) ? 'Supported' : 'Not Supported';

    }

    /*=====================================================
    SAMPLE DATA
    =====================================================*/

    function setFat(value) {

        el.fatInput.value = value ?? '';

    }

    function setSnf(value) {

        el.snfInput.value = value ?? '';

    }

    function setClr(value) {

        el.clrInput.value = value ?? '';

    }

    function setConnectedDevice(name) {

        el.deviceInput.value = name || '';

    }

    function setReceivedTime(time) {

        el.timeInput.value = time || '';

    }

    function getSampleNumber() {

        return el.sampleInput.value.trim();

    }

    function clearValues() {

        el.fatInput.value = '';

        el.snfInput.value = '';

        el.clrInput.value = '';

        el.deviceInput.value = '';

        el.timeInput.value = '';

    }

    /*=====================================================
    DEVICE LIST
    =====================================================*/

    function clearDeviceList() {

        el.deviceList.innerHTML = '';

        el.connectBtn.disabled = true;

    }

    function addDevice(device) {

        const option = document.createElement('option');

        option.textContent = device.name || 'Unknown Device';

        option.value = device.id || device.name || '';

        option.device = device;

        el.deviceList.appendChild(option);

    }

    function getSelectedDevice() {

        const option = el.deviceList.selectedOptions[0];

        return option ? option.device : null;

    }

    /*=====================================================
    RAW DATA
    =====================================================*/

    function appendRawData(data) {

        if (!data) return;

        el.rawDataPanel.textContent += data + '\n';

        el.rawDataPanel.scrollTop =
            el.rawDataPanel.scrollHeight;

    }

    function clearRawData() {

        el.rawDataPanel.textContent = '';

    }

    function getRawData() {

        return el.rawDataPanel.textContent;

    }

    async function copyRawData() {

        try {

            await navigator.clipboard.writeText(
                el.rawDataPanel.textContent
            );

            Logger.success('Raw data copied.');

        }
        catch (error) {

            Logger.error(
                'Unable to copy raw data.'
            );

        }

    }

    /*=====================================================
    BROWSER DETECTION
    =====================================================*/

    function detectBrowser() {

        const ua = navigator.userAgent;

        Logger.info('User Agent: ' + ua);

        let browser = 'Unknown';

        let version = '';

        if (ua.includes('Edg/')) {

            browser = 'Edge';
            version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';

        }
        else if (ua.includes('Chrome/')) {

            browser = 'Chrome';
            version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';

        }
        else if (ua.includes('Firefox/')) {

            browser = 'Firefox';
            version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';

        }
        else if (ua.includes('Safari/')) {

            browser = 'Safari';
            version = ua.match(/Version\/([\d.]+)/)?.[1] || '';

        }

        el.browserStatus.textContent =
            version
                ? `${browser} ${version.split('.')[0]}`
                : browser;

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        cacheElements,

        bindEvents,

        setVersion,

        showLoading,

        hideLoading,

        updateConnectionStatus,

        setSearchingStatus,

        updateBrowserStatus: detectBrowser,

        updateHttpsStatus,

        updateBluetoothSupport,

        updateSerialSupport,

        setFat,

        setSnf,

        setClr,

        setConnectedDevice,

        setReceivedTime,

        getSampleNumber,

        clearValues,

        clearDeviceList,

        addDevice,

        getSelectedDevice,

        appendRawData,

        clearRawData,

        getRawData

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
