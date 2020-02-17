// interface object over the javascript canvas which allows for easy drawing of polygons to the canvas
const canvas = (function() {
    const canvasElement = document.querySelector('.game')
    const ctx = canvasElement.getContext('2d')

    // scale used to increase the resolution of the canvas
    const scale = 2
    canvasElement.width = canvasElement.width * scale
    canvasElement.height = canvasElement.height * scale * 2

    return {
        // draw a line to the canvas; e.g. a laser
        line: function(x1, y1, x2, y2) {
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
        },
        // draw a polygon from the list of points to the canvas
        poly: function(points, lineColor = 'black', fillColor = 'white') {
            ctx.beginPath()
            ctx.strokeStyle = lineColor
            ctx.moveTo(points[0].x, points[0].y)
            for(let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y)
                ctx.stroke()
            }
            ctx.closePath()
            ctx.stroke()
            ctx.fillStyle = fillColor
            ctx.fill()
        },
        // draw a single point to the canvas
        point: function(point) {
            ctx.fillStyle = 'black'
            ctx.fillRect(point.x - 1, point.y - 1, 3, 3)
        },
        // clear the canvas for redrawing
        clear() {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
        }
    }
})();

function point(x, y) {
    return {x, y}
}

function toRad(theta) {
    return theta * Math.PI / 180
}

// prototype to inherit from to create an object with polygon methods
const polyProto = {
    // rotate the polygon by the specified amount of degrees around the centre of mass
    rotate(degrees) {
        this.points.forEach(point => {
            // calculate coordinates to polar form
            const magnitude = Math.hypot(point.x, point.y)
            let angle = Math.atan(point.y / point.x)
            
            // arctan returns identical values for opposite quadrants. therefore, adjust for that
            if(point.y >= 0 && point.x <= 0)
                angle += Math.PI
            else if(point.y <= 0 && point.x <= 0)
                angle += Math.PI
            
            // set the new position of the point after rotation
            angle = toRad(degrees) + angle
            point.x = magnitude * Math.cos(angle) 
            point.y = magnitude * Math.sin(angle)
        })
    },
    // use the canvas interface to draw the polygon to the canvas
    draw() {
        canvas.poly(this.absolutePoints, 'black', 'red')
        canvas.point(this.centreOfMass)
    },
    // polygon points are stored relative to the centre of mass of the polygon. absolute points returns the points with the centre of
    // mass factored in; e.g. the canvas positions of the points
    get absolutePoints() {
        return this.points.map(point => {return {x: point.x + this.centreOfMass.x, y: point.y + this.centreOfMass.y}})
    },
}

const poly = (function() {


    return {
        define(centreOfMass, points) {

        }
    }
})();

const test = Object.create(polyProto)
test.centreOfMass = point(200, 200)
test.points = [point(30, 0), point(-15, -10), point(-15, 10)]

setInterval(() => {
    canvas.clear()
    test.rotate(1)
    test.draw()
}, 20)