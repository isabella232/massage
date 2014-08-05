var chai    = require('chai');
var expect  = chai.expect;
var Massage = require('../massage');
var Fs      = require('fs');
var Promise = require('bluebird');

chai
.use(require('chai-as-promised'))
.use(require('chai-things'));

describe('file library', function () {
  describe('getMetaData', function () {
    it('should be able to handle a buffer', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      var testFile = Fs.readFileSync(filePath);
      return expect(Massage.getMetaData(testFile)).to.eventually.eql(
        {fileType: 'PDF', width: 6, length: 4, numPages: 1}
      );
    });

    it('should fail with an invalid buffer type', function () {
      var testFile = new Buffer(10);
      return expect(Massage.getMetaData(testFile)).to.be.rejected;
    });

    it('should fail with an invalid file type', function () {
      var filePath = __dirname + '/assets/8.5x11.docx';
      var testFile = Fs.readFileSync(filePath);
      return expect(Massage.getMetaData(testFile)).to.be.rejected;
    });
  });

  describe('validateUrl', function () {
    it('should pass with valid url and protocol', function () {
      return expect(Massage.validateUrl('https://www.lob.com'))
        .to.be.fulfilled;
    });

    it('should fail with non-url', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      Fs.readFile(filePath, function (err, buffer) {
        return expect(Massage.validateUrl(buffer))
          .to.be.rejected;
      });
    });

    it('should fail with valid url and no protocol', function () {
      return expect(Massage.validateUrl('www.lob.com'))
        .to.be.rejected;
    });
  });

  describe('getBuffer', function () {
    it('should return a buffer unmodified', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      var testFile = Fs.readFileSync(filePath);

      return Massage.getBuffer(testFile)
      .then(function (file) {
        return expect(file instanceof Buffer).to.eql(true);
      });
    });

    it('should not override url', function () {
      return Massage.getBuffer('https://www.lob.com/test.pdf')
      .then(function (file) {
        return expect(file instanceof Buffer).to.eql(true);
      });
    });

    it('should download file and return buffer', function () {
      return Massage.getBuffer('https://www.lob.com/test.pdf')
      .then(function (file) {
        return expect(file instanceof Buffer).to.eql(true);
      });
    });

    it('should throw an error for an invlaid url', function () {
      return expect(Massage.getBuffer('test.pdf')).to.be.rejected;
    });

    it('should throw an error when the url is wrong', function () {
      return expect(Massage.getBuffer('https://www.loasdfas.com'))
        .to.be.rejected;
    });
  });

  describe('merge', function () {
    it('should combine two files', function () {
      var file1 = Fs.readFileSync(__dirname + '/assets/4x6.pdf');
      var file2 = Fs.readFileSync(__dirname + '/assets/4x6.pdf');

      return Massage.merge(file1, file2)
      .then (function (mergedFile) {
        return Promise.all([
          Massage.getMetaData(file1),
          Massage.getMetaData(file2),
          Massage.getMetaData(mergedFile)
        ]);
      })
      .spread(function (file1, file2, mergedFile) {
        return expect(file1.numPages + file2.numPages)
          .to.eql(mergedFile.numPages);
      });
    });
  });

  describe('rotatePdf', function () {
    it('should rotate a PDF and return buffer', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      var testFile = Fs.readFileSync(filePath);
      return Massage.rotatePdf(testFile, 90)
      .then(function (data) {
        return expect(Massage.getMetaData(data)).to.eventually.eql(
          {fileType: 'PDF', width: 4, length: 6, numPages: 1}
        );
      });
    });

    it('should error when an invalid buffer is given', function () {
      return expect(Massage.rotatePdf(new Buffer(10), 90)).to.be.rejected;
    });

    it('should error when an invalid degrees is given', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      var testFile = Fs.readFileSync(filePath);
      return expect(Massage.rotatePdf(testFile, 33)).to.be.rejected;
    });
  });

  describe('burstPdf', function () {
    it('should burst a pdf into pages', function () {
      var filePath = __dirname + '/assets/4x6_twice.pdf';
      var testFile = Fs.readFileSync(filePath);
      return Massage.burstPdf(testFile)
      .then(function (files) {
        return expect(files).to.have.length(2);
      });
    });
  });

  describe('pngToPdf', function () {
    it('should convert a png to a pdf with valid image and dpi', function () {
      var filePath = __dirname + '/assets/1200x1800.png';
      var testFile = Fs.readFileSync(filePath);
      return Massage.pngToPdf(testFile, '300')
      .then(function (pdf) {
        expect(Massage.getMetaData(pdf)).to.eventually.eql(
          {fileType: 'PDF', width: 4, length: 6, numPages: 1}
       );
      });
    });
  });

  describe('generateThumbnail', function () {
    it('should generate a pdf with valid input', function () {
      var filePath = __dirname + '/assets/4x6.pdf';
      var testFile = Fs.readFileSync(filePath);
      return Massage.generateThumbnail(testFile, '200x300')
      .then(function (thumb) {
        expect(Massage.getMetaData(thumb)).to.eventually.eql(
          {fileType: 'PNG', width: 200, length: 300, numPages: 1}
        );
      });
    });
  });
});
