'use strict';

/*=========================================================
PARSER MODULE
=========================================================*/

const Parser = (() => {

    /*=====================================================
    PRIVATE STATE
    =====================================================*/

    let receiveBuffer = '';

    const MAX_BUFFER_SIZE = 8192;

    const PACKET_HISTORY_SIZE = 50;

    const packetHistory = [];

    /*=====================================================
    PUBLIC PARSE ENTRY
    =====================================================*/

    function parse(packet) {

        try {

            const ascii = packet.ascii || '';

            receiveBuffer += ascii;

            if (receiveBuffer.length > MAX_BUFFER_SIZE) {
            
                receiveBuffer = '';
            
                return null;
            
            }

            const completePacket = extractPacket();

            if (!completePacket) {

                return null;

            }

            addHistory(completePacket);
            
            return parsePacket(
                completePacket,
                packet
            );

        }

        catch (error) {
        
            Logger.error("Parser Exception");
        
            Logger.error(error.message);
        
            Logger.error(error.stack);
        
            return null;
        
        }

    }

    /*=====================================================
    PACKET EXTRACTION
    =====================================================*/

    function extractPacket() {

        const delimiters = [

            '\r\n',

            '\n',

            '\r'

        ];

        for (const delimiter of delimiters) {

            const index =
                receiveBuffer.indexOf(delimiter);

            if (index >= 0) {

                const packet =
                    receiveBuffer
                        .substring(0, index)
                        .trim();

                receiveBuffer =
                    receiveBuffer.substring(
                        index + delimiter.length
                    );

                if (packet.length) {

                    return packet;

                }

            }

        }

        return null;

    }

    /*=====================================================
    PACKET PARSING
    =====================================================*/

    function parsePacket(packetText, metadata) {

        const packet = packetText.trim();

        if (!packet) {

            return null;

        }

        Logger.info("parsePacket() called");
        Logger.info(packet);

        /*---------------------------------------------
        MILK ANALYZER PACKET
        
        {[1,4,0,],[2,2,16,03.1|08.7|30.82|],[3,1,0,],[4,1,0,]}
        ---------------------------------------------*/
        let result = parseMilkAnalyzerPacket(packet);
        
        if (result) {
        
            return buildResult(
                result,
                packet,
                metadata,
                'MilkAnalyzer'
            );
        
        }
        
        result = parseKeyValue(packet);

        if (result) {

            return buildResult(
                  result,
                  packet,
                  metadata,
                  'KeyValue'
              );

        }

        /*---------------------------------------------
        FORMAT 2
        FAT:4.2 SNF:8.7 CLR:28
        ---------------------------------------------*/

        result = parseColonSeparated(packet);

        if (result) {

            return buildResult(
                result,
                packet,
                metadata,
                'ColonSeparated'
            );

        }

        /*---------------------------------------------
        FORMAT 3
        4.2,8.7,28
        ---------------------------------------------*/

        result = parseCommaSeparated(packet);

        if (result) {

            return buildResult(
                result,
                packet,
                metadata,
                'CommaSeparated'
            );

        }

        /*---------------------------------------------
        FORMAT 4
        4.2 8.7 28
        ---------------------------------------------*/

        result = parseSpaceSeparated(packet);

        if (result) {

            return buildResult(
                  result,
                  packet,
                  metadata,
                  'SpaceSeparated'
              );

        }

        return null;

    }

    /*=====================================================
    RESULT BUILDER
    =====================================================*/

    function buildResult(values, rawPacket, metadata, parserType) {

            return {
        
                fat: values.fat,
        
                snf: values.snf,
        
                clr: values.clr,
        
                parser: parserType,
        
                raw: rawPacket,
        
                ascii: metadata.ascii,
        
                hex: metadata.hex,
        
                timestamp: metadata.timestamp,
        
                device: metadata.device
        
            };
        
        }
        
        function isValidResult(values) {
        
            return Number.isFinite(values.fat) &&
                   Number.isFinite(values.snf) &&
                   Number.isFinite(values.clr);
        
        }
  
    /*=====================================================
    MILK ANALYZER PARSER
    
    Example
    
    {[1,4,0,],[2,2,16,03.1|08.7|30.82|],[3,1,0,],[4,1,0,]}
    
    =====================================================*/
    
    function parseMilkAnalyzerPacket(packet) {
    
        Logger.info("=== Milk Analyzer Parser ===");
        Logger.info("Packet:");
        Logger.info(packet);
    
        const match = packet.match(
            /\[2,2,16,([^]]+)\]/
        );
    
        if (!match) {
    
            Logger.error("Milk Analyzer Regex Failed");
    
            return null;
    
        }
    
        Logger.success("Regex Match:");
        Logger.success(match[1]);
    
        const values = match[1]
            .split('|')
            .filter(Boolean);
    
        Logger.info("Values Count: " + values.length);
        Logger.info("Values: " + JSON.stringify(values));
    
        if (values.length < 3) {
    
            Logger.error("Less than 3 values found.");
    
            return null;
    
        }
    
        const result = {
    
            fat: parseFloat(values[0]),
    
            snf: parseFloat(values[1]),
    
            clr: parseFloat(values[2])
    
        };
    
        Logger.info("Parsed Result:");
        Logger.info(JSON.stringify(result));
    
        if (!isValidResult(result)) {
    
            Logger.error("Invalid Result");
    
            Logger.error(
                "fat=" + result.fat +
                ", snf=" + result.snf +
                ", clr=" + result.clr
            );
    
            return null;
    
        }
    
        Logger.success(
            "Milk Analyzer Parsed Successfully"
        );
    
        return result;
    
    }
    
    /*=====================================================
    KEY VALUE PARSER
    Example:
    FAT=4.2,SNF=8.7,CLR=28
    =====================================================*/

    function parseKeyValue(packet) {

        const fat =
            packet.match(/FAT\s*=\s*([0-9.]+)/i);

        const snf =
            packet.match(/SNF\s*=\s*([0-9.]+)/i);

        const clr =
            packet.match(/CLR\s*=\s*([0-9.]+)/i);

        if (!fat || !snf || !clr) {

            return null;

        }

        const result = {
        
            fat: Number(fat[1]),
        
            snf: Number(snf[1]),
        
            clr: Number(clr[1])
        
        };
        
        return isValidResult(result)
            ? result
            : null;

    }

    /*=====================================================
    COLON SEPARATED PARSER
    Example:
    FAT:4.2 SNF:8.7 CLR:28
    =====================================================*/

    function parseColonSeparated(packet) {

        const fat =
            packet.match(/FAT\s*:\s*([0-9.]+)/i);

        const snf =
            packet.match(/SNF\s*:\s*([0-9.]+)/i);

        const clr =
            packet.match(/CLR\s*:\s*([0-9.]+)/i);

        if (!fat || !snf || !clr) {

            return null;

        }

        const result = {
        
            fat: Number(fat[1]),
        
            snf: Number(snf[1]),
        
            clr: Number(clr[1])
        
        };
        
        return isValidResult(result)
            ? result
            : null;

    }

    /*=====================================================
    COMMA SEPARATED PARSER
    Example:
    4.2,8.7,28
    =====================================================*/

    function parseCommaSeparated(packet) {

        const values =
            packet.split(',');

        if (values.length < 3) {

            return null;

        }

        const result = {
        
            fat: Number(values[0]),
        
            snf: Number(values[1]),
        
            clr: Number(values[2])
        
        };
        
        return isValidResult(result)
            ? result
            : null;

    }

    /*=====================================================
    SPACE SEPARATED PARSER
    Example:
    4.2 8.7 28
    =====================================================*/

    function parseSpaceSeparated(packet) {

        const values =
            packet
                .trim()
                .split(/\s+/);

        if (values.length < 3) {

            return null;

        }

        const result = {
        
            fat: Number(values[0]),
        
            snf: Number(values[1]),
        
            clr: Number(values[2])
        
        };
        
        return isValidResult(result)
            ? result
            : null;

    }

    /*=====================================================
    PACKET HISTORY
    =====================================================*/

    function addHistory(packet) {

        packetHistory.push({

            timestamp: new Date().toISOString(),

            packet: packet

        });

        while (packetHistory.length > PACKET_HISTORY_SIZE) {

            packetHistory.shift();

        }

    }

    function getPacketHistory() {

        return [...packetHistory];

    }

    /*=====================================================
    BUFFER
    =====================================================*/

    function clearBuffer() {

        receiveBuffer = '';

    }

    function getBuffer() {

        return receiveBuffer;

    }

    /*=====================================================
    PACKET HISTORY
    =====================================================*/

    function clearHistory() {

        packetHistory.length = 0;

    }

    /*=====================================================
    PARSER INFORMATION
    =====================================================*/

    function getInfo() {

        return {

            bufferSize: receiveBuffer.length,

            historyCount: packetHistory.length,

            maxBufferSize: MAX_BUFFER_SIZE,

            maxHistorySize: PACKET_HISTORY_SIZE

        };

    }

    /*=====================================================
    RESET
    =====================================================*/

    function reset() {

        clearBuffer();

        clearHistory();

    }

    /*=====================================================
    PUBLIC API
    =====================================================*/

    return {
    
        parse,
    
        reset,
    
        clearBuffer,
    
        getBuffer,
    
        clearHistory,
    
        getPacketHistory,
    
        getInfo
    
    };

})();
  
/*=========================================================
END OF FILE
=========================================================*/
