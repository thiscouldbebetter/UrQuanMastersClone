"use strict";
class CsvCompressor {
    compress(dataToCompress) {
        var blank = CsvCompressor.Blank;
        var comma = CsvCompressor.Comma;
        var newline = CsvCompressor.Newline;
        var linesToCompress = dataToCompress.split(newline);
        var lineToCompress0 = linesToCompress[0];
        var valuesToCompressPrev = lineToCompress0.split(comma);
        var linesCompressed = [lineToCompress0];
        for (var i = 1; i < linesToCompress.length; i++) {
            var lineToCompress = linesToCompress[i];
            var valuesToCompress = lineToCompress.split(comma);
            var valuesCompressed = [];
            for (var v = 0; v < valuesToCompress.length; v++) {
                var valueToCompress = valuesToCompress[v];
                var valueToCompressPrev = valuesToCompressPrev[v];
                var isValueSameAsPrev = (valueToCompress == valueToCompressPrev);
                var valueCompressed = (isValueSameAsPrev ? blank : valueToCompress);
                if (isValueSameAsPrev == false) {
                    valuesToCompressPrev[v] = valueToCompress;
                }
                valuesCompressed.push(valueCompressed);
            }
            var lineCompressed = valuesCompressed.join(comma);
            linesCompressed.push(lineCompressed);
        }
        var dataCompressed = linesCompressed.join(newline);
        return dataCompressed;
    }
    decompress(dataToDecompress) {
        var blank = CsvCompressor.Blank;
        var comma = CsvCompressor.Comma;
        var newline = CsvCompressor.Newline;
        var linesToDecompress = dataToDecompress.split(newline);
        var lineToDecompress0 = linesToDecompress[0];
        var valuesToDecompressPrev = lineToDecompress0.split(comma);
        var linesDecompressed = [lineToDecompress0];
        for (var i = 1; i < linesToDecompress.length; i++) {
            var lineToDecompress = linesToDecompress[i];
            if (lineToDecompress != "") {
                var valuesToDecompress = lineToDecompress.split(comma);
                var valuesDecompressed = [];
                for (var v = 0; v < valuesToDecompress.length; v++) {
                    var valueToDecompress = valuesToDecompress[v];
                    var valueToDecompressPrev = valuesToDecompressPrev[v];
                    var isValueBlank = (valueToDecompress == blank);
                    var valueDecompressed = (isValueBlank ? valueToDecompressPrev : valueToDecompress);
                    if (isValueBlank == false) {
                        valuesToDecompressPrev[v] = valueToDecompress;
                    }
                    valuesDecompressed.push(valueDecompressed);
                }
                var lineDecompressed = valuesDecompressed.join(comma);
                linesDecompressed.push(lineDecompressed);
            }
        }
        var dataDecompressed = linesDecompressed.join(newline);
        return dataDecompressed;
    }
}
CsvCompressor.Blank = "";
CsvCompressor.Comma = ",";
CsvCompressor.Newline = "\n";
