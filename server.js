var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var Search = require('./models/imgsearch')
var path = require('path')
var url = require('url')
//var dotenv = require('dotenv')    for cloud9
//dotenv.load()
var accessKey = process.env.BING_KEY

var Bing = require('node-bing-api')({'accKey': accessKey})


app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

var port = process.env.PORT || 8080

var router = express.Router()

var searchTerm = ''
var offset = 5
var output = []
var dburl = process.env.MONGOLAB_URI
//var dburl = 'mongodb://localhost:27017/imgsearches'

mongoose.connect(dburl)

router.use(function(req, res, next) {
    // do logging
    console.log('something is happening')
    next()  // make sure we go to the next routes and don't stop here
})


router.route('/image/:searchTerm')
    .get(function(req, res) {  
        searchTerm = req.params.searchTerm  //comes before the ? mark, searchTerm is a string
        var reqUrl = url.parse(req.url, true)
        var query = reqUrl.query    // json {'offset':10} for example
        offset = query['offset']
        
        if (offset < 0) {
            offset = 1
        } else if (offset > 50) {
            offset = 50
        }
        
        function dispImages() {
            res.json(output)
        }
        
        getImages(searchTerm, offset, dispImages)   //using async callback method
        
        var asearch = new Search()
        asearch.term = searchTerm
        var datetime = new Date()
        asearch.when = datetime
        
        asearch.save(function(err) {
            if (err) {console.log(err)}
            
            console.log('asearch created')   
            
        })
        console.log(datetime)
    })

router.route('/latest')
    .get(function(req, res){
        var options = {
            "limit": 10,
            "sort": {'when': -1}
        }
        
        Search.find({}, {
            "_id" : false,
            "term": true,
            "when": true
            }, options, function(err, searches) {
            if (err) {throw err}

            res.json(searches)
        })
    })

app.use('/api', router)

app.listen(port)

console.log('App listening in port ' + port)

function getImages(searchT, offS, callback) {
    Bing.images(searchT, {
        top: offS
    }, function(err, res, body) {
        if (err) {throw err}
        
        for (var i = 0; i < offS; i++) {
            output[i] = 
                {'name': body.value[i].name,
                'url': body.value[i].thumbnailUrl
                }
        }
    callback()    
    })
}