const streamifier = require('streamifier')
const busboy = require('connect-busboy')
const fs = require('fs-extra')

class fileObj {
    constructor(name, data, dataEC = 'buffer', encoding, mimetype) {
        this._name = name
        this._data = data
        this._dataEC = dataEC
        this._encoding = encoding
        this._mimetype = mimetype
    }
    saveFile(path, callback = (err) => {
        console.log(err)
    }) {
        const fStream = fs.createWriteStream(path);
        if (Buffer.isBuffer(this._data)) {
            var _buf = this._data
        } else {
            var _buf = Buffer.from(this._data, this._dataEC)
        }
        streamifier.createReadStream(_buf).pipe(fStream)
        fStream.on('error', function(error) {
            callback(error);
        })
        fStream.on('close', function() {
            callback(null, {
                status: 'success',
                path: path
            });
        })
    }
    get name() {
        return this._name
    }
    get data() {
        return this._data
    }
    get dataEC() {
        return this._dataEC
    }
    get encoding() {
        return this._encoding
    }
    get mimetype() {
        return this._mimetype
    }
}

module.exports = (options = {}) => {
    const ec = options.ec || ''
    if (options.hasOwnProperty('ec')) {
        delete options.ec
    }
    return (req, res, next) => {
        //
        return busboy(options)(req, res, () => {
            if (req.busboy) {
                req.body = req.body || {}
                req.files = {}
                // prase file
                req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    let buf = new Buffer(0);
                    let fileData
                    file.on('data', function(data) {
                        buf = Buffer.concat([buf, data]);
                        fileData = buf
                        if (ec !== '') {
                            fileData = buf.toString(ec)
                        }
                    })

                    file.on('end', function() {
                        if (!req.files || !req.files[fieldname]) {
                            req.files[fieldname] = []
                        }
                        if (fileData) {
                            return req.files[fieldname].push(new fileObj(filename, fileData, ec, encoding, mimetype))
                        } else {
                            return req.files[fieldname]
                        }
                    })
                })
                // prase field
                req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
                    req.body[key] = value
                })
            } else {
                return next()
            }
            req.busboy.on('finish', next)
            req.pipe(req.busboy)
        })
    }
}
