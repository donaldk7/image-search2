var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SearchSchema = new Schema({
    term: String,
    when: Date
})

module.exports = mongoose.model('Search', SearchSchema)