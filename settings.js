'use strict';

/*=========================================================
SETTINGS MODULE
=========================================================*/

const Settings = (() => {

    /*=====================================================
    DEFAULT SETTINGS
    =====================================================*/

    const defaults = {

        apiUrl: '',

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

            if (settings.apiUrl) {

                API.initialize(
                    settings.apiUrl
                );

            }

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





                  
