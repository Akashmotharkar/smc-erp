'use strict';

/*=========================================================
LOGGER
=========================================================*/

const Logger = (() => {

    const MAX_LOGS = 1000;

    const logs = [];

    function now() {

        return new Date().toLocaleTimeString('en-IN', {
            hour12: false
        });

    }

    function add(type, message) {

        const entry = {
            time: now(),
            type,
            message
        };

        logs.push(entry);

        if (logs.length > MAX_LOGS) {

            logs.shift();

        }

        render(entry);

    }

    function render(entry) {

        const panel = document.getElementById('logPanel');

        if (!panel) return;

        const row = document.createElement('div');

        row.className = 'log-item log-' + entry.type;

        const time = document.createElement('div');

        time.className = 'log-time';

        time.textContent = entry.time;

        const msg = document.createElement('div');

        msg.className = 'log-message';

        msg.textContent = entry.message;

        row.appendChild(time);

        row.appendChild(msg);

        panel.appendChild(row);

        panel.scrollTop = panel.scrollHeight;

    }

    function info(message) {

        add('info', message);

    }

    function success(message) {

        add('success', message);

    }

    function warning(message) {

        add('warning', message);

    }

    function error(message) {

        add('error', message);

    }

    function parser(message) {

        add('parser', message);

    }

    function receive(message) {

        add('receive', message);

    }

    function api(message) {

        add('api', message);

    }

    function clear() {

        logs.length = 0;

        const panel = document.getElementById('logPanel');

        if (panel) {

            panel.innerHTML = '';

        }

        info('Log cleared.');

    }

    function copy() {

        const text = exportText();

        if (!navigator.clipboard) {

            warning('Clipboard API not supported.');

            return;

        }

        navigator.clipboard.writeText(text)
            .then(() => {

                success('Log copied to clipboard.');

            })
            .catch(error => {

                Logger.error(error.message);

            });

    }

    function download() {

        const text = exportText();

        const blob = new Blob([text], {
            type: 'text/plain'
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        const stamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-');

        link.download = 'Bluetooth_Log_' + stamp + '.txt';

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        success('Log downloaded.');

    }

    function exportText() {

        return logs
            .map(item =>
                '[' +
                item.time +
                '] [' +
                item.type.toUpperCase() +
                '] ' +
                item.message
            )
            .join('\n');

    }

    function getLogs() {

        return [...logs];

    }

    return {

        info,

        success,

        warning,

        error,

        parser,

        receive,

        api,

        clear,

        copy,

        download,

        exportText,

        getLogs

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
