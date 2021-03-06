let mouseX, mouseY

// interface object over the javascript canvas which allows for easy drawing of polygons to the canvas
const canvas = (function() {

    const canvasElement = document.querySelector('.game')
    const rect = canvasElement.getBoundingClientRect()
    
    // scale used to increase the resolution of the canvas
    const scale = 1
    canvasElement.width = rect.width * scale
    canvasElement.height = rect.height * scale
    
    // update mouse position
    canvasElement.addEventListener('mousemove', event => {
        mouseX = event.clientX - rect.left - scrollX
        mouseY = event.clientY - rect.top - scrollY

        mouseX /= rect.width
        mouseY /= rect.height

        mouseX *= canvasElement.width
        mouseY *= canvasElement.height
    })
    const ctx = canvasElement.getContext('2d')
    
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
        },
        get centreLocation() {
            return {x: canvasElement.width / 2, y: canvasElement.height / 2}
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
            
            console.log(angle)
            // arctan returns identical values for opposite quadrants. therefore, adjust for that
            if(point.y > 0 && point.x < 0) {
                angle += Math.PI
                console.log('changed 1')
            }
            else if(point.y < 0 && point.x < 0) {
                angle += Math.PI
                console.log('changed 2')
            }
            
            // set the new position of the point after rotation
            angle = toRad(degrees) + angle
            point.x = magnitude * Math.cos(angle) 
            point.y = magnitude * Math.sin(angle)
        })
    },
    // use the canvas interface to draw the polygon to the canvas
    draw() {
        // canvas.poly(this.absolutePoints, 'black', 'red')
        this.absolutePoints.forEach(point => {
            canvas.line(point.x, point.y, this.centreOfMass.x, this.centreOfMass.y)
        })
        canvas.point(this.centreOfMass)
    },
    // set the location of the centre of mass of the polygon
    setLocation(x, y) {
        this.centreOfMass = point(x, y)
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

const playerProto = {
    rotate(degrees) {
        this.rotation += degrees
        if(this.rotation > 360) this.rotation -= 360
        if(this.rotation < -360) this.rotation += 360

        this.poly.rotate(degrees)
    }
}

function createPlayer() {
    const player = Object.create(playerProto)
    
    player.rotation = 0
    player.poly = Object.create(polyProto)
    player.poly.centreOfMass = point(300, 100)
    // player.poly.points = [point(60, 0), point(-30, -20), point(-30, 20)]
    player.poly.points = [point(0, 30), point(-10, -15), point(10, -15)]

    return player
}

const player = createPlayer()

setInterval(() => {
    canvas.clear()
    player.rotate(1)
    player.poly.draw()
    canvas.point(600, 400)
}, 20)