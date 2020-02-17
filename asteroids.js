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
