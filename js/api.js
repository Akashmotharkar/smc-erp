'use strict';

alert('API JS VERSION 5');

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
            throw new Error('Apps Script API URL is not configured.');
        }
    
        const url = new URL(baseUrl);
    
        if (method === 'GET') {
    
            url.searchParams.set('action', action);
    
            Logger.api('GET: ' + url);
    
            const response = await fetch(url);
    
            const text = await response.text();
    
            Logger.api(text);
    
            return JSON.parse(text);
        }
    
        Logger.api('POST: ' + url);
    
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                data: body
            })
        });
    
        const text = await response.text();
    
        Logger.api(text);
    
        return JSON.parse(text);
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
