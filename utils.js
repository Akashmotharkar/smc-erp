'use strict';

/*=========================================================
UTILITY FUNCTIONS
=========================================================*/

const Utils = (() => {

    /*=====================================================
    DATE & TIME
    =====================================================*/

    function formatDate(date = new Date()) {

        return date.toLocaleDateString(
            'en-IN'
        );

    }

    function formatTime(date = new Date()) {

        return date.toLocaleTimeString(
            'en-IN',
            {
                hour12: false
            }
        );

    }

    function formatDateTime(date = new Date()) {

        return (
            formatDate(date) +
            ' ' +
            formatTime(date)
        );

    }

    /*=====================================================
    SAFE NUMBER
    =====================================================*/

    function toNumber(value, defaultValue = 0) {

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : defaultValue;

    }

    function round(value, decimals = 2) {

        return Number(
            toNumber(value)
                .toFixed(decimals)
        );

    }

    /*=====================================================
    STRING
    =====================================================*/

    function cleanString(value) {

        return String(value ?? '')
            .trim();

    }

    function isEmpty(value) {

        return cleanString(value) === '';

    }

    /*=====================================================
    BYTE CONVERSION
    =====================================================*/

    function bytesToHex(bytes) {

        if (!(bytes instanceof Uint8Array)) {

            return '';

        }

        return Array.from(bytes)
            .map(byte =>
                byte
                    .toString(16)
                    .padStart(2, '0')
                    .toUpperCase()
            )
            .join(' ');

    }

    function hexToBytes(hex) {

        const cleanHex = cleanString(hex)
            .replace(/\s+/g, '');

        if (!cleanHex ||
            cleanHex.length % 2 !== 0) {

            return new Uint8Array();

        }

        const bytes = new Uint8Array(
            cleanHex.length / 2
        );

        for (let i = 0; i < cleanHex.length; i += 2) {

            bytes[i / 2] = parseInt(
                cleanHex.substring(i, i + 2),
                16
            );

        }

        return bytes;

    }

    function bytesToAscii(bytes) {

        if (!(bytes instanceof Uint8Array)) {

            return '';

        }

        return new TextDecoder().decode(bytes);

    }

    function asciiToBytes(text) {

        return new TextEncoder().encode(

            cleanString(text)

        );

    }

    /*=====================================================
    UUID
    =====================================================*/

    function formatUuid(uuid) {

        return cleanString(uuid)
            .toUpperCase();

    }

    /*=====================================================
    VALIDATION
    =====================================================*/

    function isFiniteNumber(value) {

        return Number.isFinite(

            Number(value)

        );

    }

    /*=====================================================
    CLIPBOARD
    =====================================================*/

    async function copyToClipboard(text) {

        await navigator.clipboard.writeText(

            cleanString(text)

        );

    }

    /*=====================================================
    DOWNLOAD
    =====================================================*/

    function downloadText(filename, text) {

        const blob = new Blob(

            [text],

            {

                type: 'text/plain'

            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        formatDate,

        formatTime,

        formatDateTime,

        toNumber,

        round,

        cleanString,

        isEmpty,

        bytesToHex,

        hexToBytes,

        bytesToAscii,

        asciiToBytes,

        formatUuid,

        isFiniteNumber,

        copyToClipboard,

        downloadText

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
