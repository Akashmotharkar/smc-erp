'use strict';

/*=========================================================
SERIAL MODULE
=========================================================*/

const Serial = (() => {

    /*=====================================================
    PRIVATE STATE
    =====================================================*/

    let port = null;

    let reader = null;

    let writer = null;

    let inputDone = null;

    let outputDone = null;

    let readLoopRunning = false;

    /*=====================================================
    SEARCH
    =====================================================*/

    async function search() {

        try {

            if (!('serial' in navigator)) {

                throw new Error(
                    'Web Serial API is not supported.'
                );

            }

            if (isConnected()) {

                Logger.info(
                    'Disconnecting previous Serial connection...'
                );

                await disconnect();

            }

            Logger.info(
                'Opening Serial device picker...'
            );

            port = await navigator.serial.requestPort();

            if (!port) {

                Logger.warning(
                    'No Serial device selected.'
                );

                return;

            }

            Logger.success(
                'Serial device selected.'
            );

            Bluetooth.deviceFound({

                id: 'serial-port',

                name: 'Serial Bluetooth Device',

                port: port

            });

        }
        catch (error) {

            Logger.error(error.message);

        }

    }

    /*=====================================================
    CONNECT
    =====================================================*/

    async function connect(device) {

        try {

            if (!device || !device.port) {

                throw new Error(
                    'Invalid Serial device.'
                );

            }

            port = device.port;

            Logger.info(
                'Opening serial port...'
            );

            await port.open({

                baudRate: Settings.getBaudRate()

            });

            Logger.success(
                'Serial port opened.'
            );

            startReading();

        }
        catch (error) {

            Logger.error(error.message);

            throw error;

        }

    }

    /*=====================================================
    READ LOOP
    =====================================================*/

    async function startReading() {

        if (!port.readable) {

            throw new Error(
                'Serial port is not readable.'
            );

        }

        Logger.info(
            'Starting serial read loop...'
        );

        reader = port.readable.getReader();

        readLoopRunning = true;

        while (readLoopRunning) {

            try {

                const { value, done } =
                    await reader.read();

                if (done) {

                    Logger.warning(
                        'Serial reader closed.'
                    );

                    break;

                }

                if (!value || !value.length) {

                    continue;

                }

                Bluetooth.packetReceived(value);

            }
            catch (error) {

                Logger.error(
                    'Serial read failed.'
                );

                Logger.error(error.message);

                break;

            }

        }

        Logger.info(
            'Serial read loop stopped.'
        );

    }

    /*=====================================================
    WRITE
    =====================================================*/

    async function write(data) {

        try {

            if (!port || !port.writable) {

                throw new Error(
                    'Serial port is not writable.'
                );

            }

            writer = port.writable.getWriter();

            const bytes =
                data instanceof Uint8Array
                    ? data
                    : new TextEncoder().encode(data);

            await writer.write(bytes);

            Logger.success(
                'Serial data transmitted.'
            );

        }
        catch (error) {

            Logger.error(error.message);

            throw error;

        }
        finally {

            if (writer) {

                writer.releaseLock();

                writer = null;

            }

        }

    }

    /*=====================================================
    DISCONNECT
    =====================================================*/

    async function disconnect() {

        try {

            Logger.info(
                'Closing serial connection...'
            );

            readLoopRunning = false;

            if (port && port.readable && reader) {

                  try {
              
                      await reader.cancel();
              
                  }
                  catch (error) {
              
                      Logger.warning(
                          'Reader cancel failed.'
                      );
              
                  }
              
                  try {
              
                      reader.releaseLock();
              
                  }
                  catch (error) {
              
                  }
              
                  reader = null;
              
              }

            if (port && port.writable && writer) {

                    try {
                
                        writer.releaseLock();
                
                    }
                    catch (error) {
                
                    }
                
                    writer = null;
                
                }
          
            if (port) {

                try {
            
                    if (port.readable || port.writable) {
            
                        await port.close();
            
                    }
            
                }
                catch (error) {
            
                    Logger.warning(
                        'Port close failed.'
                    );
            
                }
            
            }

            cleanup();

            Logger.success(
                'Serial disconnected.'
            );

        }
        catch (error) {

            Logger.error(error.message);

            cleanup();

            throw error;

        }

    }

    /*=====================================================
    CLEANUP
    =====================================================*/

    function cleanup() {

        reader = null;

        writer = null;

        inputDone = null;

        outputDone = null;

        readLoopRunning = false;

    }

    /*=====================================================
    CONNECTION STATUS
    =====================================================*/

    function isConnected() {

        return !!(
            port &&
            port.readable &&
            readLoopRunning
        );

    }

    function getPort() {

        return port;

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {

        search,

        connect,

        disconnect,

        write,

        isConnected,

        getPort

    };

})();

/*=========================================================
END OF FILE
=========================================================*/
