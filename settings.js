'use strict';

/*=========================================================
SETTINGS MODULE
=========================================================*/

const Settings = (() => {

    /*=====================================================
    DEFAULT SETTINGS
    =====================================================*/

    const defaults = {

        baudRate: 9600,

        packetTimeout: 3000,

        autoReconnect: false,

        parserMode: 'AUTO',

        logLevel: 'INFO',

        maxLogs: 1000,

        theme: 'LIGHT'

    };

    let settings = {

        ...defaults

    };

    /*=====================================================
    LOAD
    =====================================================*/

    async function load() {

        try {

            const config =
                await API.getConfig();

            if (config &&
                config.success &&
                config.settings) {

                settings = {

                    ...defaults,

                    ...config.settings

                };

                Logger.success(
                    'Settings loaded.'
                );

            }
            else {

                Logger.warning(
                    'Using default settings.'
                );

            }

        }
        catch (error) {

            Logger.warning(
                'Settings API unavailable. Using defaults.'
            );

        }

    }

    /*=====================================================
    GETTERS
    =====================================================*/

    function get(key) {

        return settings[key];

    }

    function getBaudRate() {

        return Number(
            settings.baudRate
        );

    }

    function getPacketTimeout() {

        return Number(
            settings.packetTimeout
        );

    }

    function getParserMode() {

        return settings.parserMode;

    }

    function getLogLevel() {

        return settings.logLevel;

    }

    function getMaxLogs() {

        return Number(
            settings.maxLogs
        );

    }

    function getTheme() {

        return settings.theme;

    }

    function isAutoReconnectEnabled() {

        return Boolean(
            settings.autoReconnect
        );

    }

    /*=====================================================
    SETTERS
    =====================================================*/

    function set(key, value) {
    
        if (!(key in defaults)) {
    
            throw new Error(
                'Unknown setting: ' + key
            );
    
        }
    
        settings[key] = value;
    
    }

    function reset() {

        settings = {

            ...defaults

        };

    }

    /*=====================================================
    INFORMATION
    =====================================================*/

    function getAll() {

        return {

            ...settings

        };

    }


    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        load,

        get,

        getAll,

        set,

        reset,

        getBaudRate,

        getPacketTimeout,

        getParserMode,

        getLogLevel,

        getMaxLogs,

        getTheme,

        isAutoReconnectEnabled

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
