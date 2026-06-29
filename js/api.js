'use strict';

/*=========================================================
APPLICATION CONFIGURATION
=========================================================*/

const CONFIG = {

    API_URL: 'https://script.google.com/macros/s/AKfycbyw8N2mK5KukJhqIXCIAhKx2XoqDxfCO-3Y7QuyCi0w9bBw7GK1-cSimzdI84CUnoDb/exec'
};

/*=========================================================
API MODULE
=========================================================*/

const API = (() => {

/*=====================================================
CONFIGURATION
=====================================================*/

let baseUrl = '';

const MAX_RETRIES = 3;

const RETRY_DELAY = 1000;

    /*=====================================================
    INITIALIZE
    =====================================================*/

    function initialize(url) {

    baseUrl = (url || '').trim();

    if (!baseUrl) {

        throw new Error(
            'API URL is empty.'
        );

    }

}

    function delay(ms) {

        return new Promise(resolve => {
    
            setTimeout(resolve, ms);
    
        });
    
    }

    /*=====================================================
    REQUEST
    =====================================================*/

    async function request(action, method = 'GET', body = null) {
    
        if (!baseUrl) {
    
            throw new Error(
                'Apps Script API URL is not configured.'
            );
    
        }
        
        const url = new URL(baseUrl);
        
        const options = {
        
            method,
        
            headers: {
        
                'Content-Type': 'application/json'
        
            }
        
        };
        
        if (method === 'GET') {
        
            url.searchParams.set(
                'action',
                action
            );
        
        }
    
        else {
    
            options.body = JSON.stringify({
    
                action,
    
                data: body
    
            });
    
        }
    
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    
            const controller = new AbortController();
    
            const timeout = setTimeout(() => {
    
                controller.abort();
    
            }, 10000);
    
            options.signal = controller.signal;
    
            try {
    
                Logger.api(
                    method +
                    ' ' +
                    action +
                    ' (Attempt ' +
                    attempt +
                    '/' +
                    MAX_RETRIES +
                    ')'
                );
    
                const response = await fetch(
                      url.toString(),
                      options
                  );
    
                clearTimeout(timeout);
    
                if (!response.ok) {
    
                    throw new Error(
                        'HTTP ' +
                        response.status
                    );
    
                }
    
                const result = await response.json();
    
                if (attempt > 1) {
    
                    Logger.success(
                        'API request succeeded on retry.'
                    );
    
                }
    
                return result;
    
            }

            catch (error) {

                clearTimeout(timeout);
            
                Logger.error(
                    error.name + ': ' + error.message
                );
            
                if (attempt === MAX_RETRIES) {
            
                    Logger.error(
                        'API request failed after ' +
                        MAX_RETRIES +
                        ' attempts.'
                    );
            
                    throw error;
            
                }
            
                Logger.warning(
                    'API request failed. Retrying in ' +
                    attempt +
                    ' second(s)...'
                );
            
                await delay(
                    RETRY_DELAY * attempt
                );
            
            }
    
        }
    
    }

  
    /*=====================================================
    HEALTH CHECK
    =====================================================*/

    async function health() {

        return await request(
            'health',
            'GET'
        );

    }

    /*=====================================================
    GET CONFIGURATION
    =====================================================*/

    async function getConfig() {

        return await request(
            'config',
            'GET'
        );

    }

    /*=====================================================
    SAVE SAMPLE
    =====================================================*/

    async function saveSample(sample) {

        return await request(
            'saveSample',
            'POST',
            sample
        );

    }

    /*=====================================================
    SAVE LOG
    =====================================================*/

    async function saveLog(log) {

        return await request(
            'saveLog',
            'POST',
            log
        );

    }

    /*=====================================================
    GENERIC METHODS
    =====================================================*/

    async function get(action) {

        return await request(
            action,
            'GET'
        );

    }

    async function post(action, data) {

        return await request(
            action,
            'POST',
            data
        );

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        initialize,

        health,

        getConfig,

        saveSample,

        saveLog,

        get,

        post

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
