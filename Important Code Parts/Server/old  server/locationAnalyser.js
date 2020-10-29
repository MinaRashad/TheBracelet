var fs = require('fs')
var qs = require('qs')

function readPoints(path)
{
    var data = fs.readFileSync(path)
    var locations = []
    data = data.toString()
    var pointpairs = data.split('\n')
    for (let i = 0; i < pointpairs.length; i++) {
        var point = pointpairs[i].split(',')
        const e = {'x':point[0],'y':point[1]};
        if(e.x && e.y){
            locations.push(e)
        }
    }
    return locations
}
//this will look to see if a point was recorded before
function isSuspicious(point,pointsDB)
{
    let rangeOfAverage = 5
    isnormal = false
    for (let i = 0; i < pointsDB.length; i++) {
        currentPoint = pointsDB[i]
        if(Math.abs(currentPoint.x - point.x) <= rangeOfAverage)
        {
            if(Math.abs(currentPoint.y - point.y) <= rangeOfAverage){
                isnormal = true
                break;
            }
        }
        
    }
    return !isnormal
}
exports.readPoints = readPoints
exports.isSuspicious = isSuspicious