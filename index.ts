import './style.css'; // Import stylesheets

import { findMats, getPathsFromStr, Mat, traverseEdges, toScaleAxis } from 'flo-mat';

const NS = 'http://www.w3.org/2000/svg'; // Svg namespace

/**
 * Creates and returns an SVG DOM element.
 * @param id The dom id to assign to the SVG element, e.g. 1 -> 'svg-1'
 */
function createSvg(id: number) {
    let $e = document.createElementNS(NS, 'svg');
    $e.setAttributeNS(null, 'id', 'svg' + id);
    $e.setAttributeNS(null, 'style', 'width: 100%; display: inline-block');
    $e.setAttributeNS(null, 'viewBox', '0 -400 1000 1500');

    return $e;
}

/**
 * Returns an SVG path string of a line.
 * @param ps The line endpoints.
 */
function getLinePathStr(ps: number[][]) {
    let [[x0,y0],[x1,y1]] = ps;
    return `M${x0} ${y0} L${x1} ${y1}`;
}

/**
 * Returns an SVG path string of a quadratic bezier curve.
 * @param ps The quadratic bezier control points.
 */
function getQuadBezierPathStr(ps: number[][]) {
    let [[x0,y0],[x1,y1],[x2,y2]] = ps;
    return `M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2}`;
}

/**
 * Returns an SVG path string of a cubic bezier curve.
 * @param ps The cubic bezier control points.
 */
function getCubicBezierPathStr(ps: number[][]) {
    let [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = ps;
    return `M${x0} ${y0} C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
}

/* Warning: Outer curves and inner curves must be oriented in opposite directions */

/**
 * The SVG path string representing our shape.
 */
const svgPathStr = `
 M 800 200 L 800 -300 L 100 -300 L 100 200 z
 M 300 -200 L 300 -100 L 200 -100 L 200 -200 z
 M 500 -100 L 500 0 L 400 0 L 400 -100 z
 M 700 0 L 700 100 L 600 100 L 600 0 z
 
 M 800 800 L 800 300 L 100 300 L 100 800 z
 M 300 400 L 300 500 L 200 500 L 200 400 z
 M 500 500 L 500 600 L 400 600 L 400 500 z
 M 700 600 L 700 700 L 600 700 L 600 600 z   
`;


/**
 * Adds a path to the given SVG element and give it a shape-path class.
 */
function setSvgShapePath(
        $svg: SVGSVGElement, 
        pathStr: string) {

    let $path = document.createElementNS(NS, 'path'); // Create SVG path elem.
    $path.setAttribute('class', 'shape-path'); 
    $svg.appendChild($path); // Add the path element to the SVG.
    document.body.appendChild($svg); // Add the SVG to the document body.
    $path.setAttribute('d', svgPathStr); 
}


function main() {
    // Create and add and SVG element to our HTML page.
    let $svg = createSvg(1); // Create SVG element.

    setSvgShapePath($svg, svgPathStr);

    // Get loops (representing the shape) from some SVG path.
    let bezierLoops = getPathsFromStr(svgPathStr);
        
    // Get MATs from the loops.
    let mats = findMats(bezierLoops, 3);

    // Draw the MATs.
    drawMats(mats, $svg, 'mat');

    // Get the SAT (at scale 1.5) of the MATs (of which there is only 1)
    let sats = mats.map(mat => toScaleAxis(mat, 1.5));

    drawMats(sats, $svg, 'sat');
}


/**
 * Returns a function that draws an array of MAT curves on an SVG element.
 * @param mats An array of MATs to draw.
 * @param svg The SVG element on which to draw.
 * @param type The type of MAT to draw. This simply affects the class on the 
 * path element.
  */
function drawMats(
        mats: Mat[],
        svg: SVGSVGElement,
        type: 'mat' | 'sat') {

    mats.forEach(f);

    /**
     * Draws a MAT curve on an SVG element.
     */
     function f(mat: Mat) {
        let cpNode = mat.cpNode;
        
        if (!cpNode) { return; }

        let fs = [,,getLinePathStr, getQuadBezierPathStr, getCubicBezierPathStr];

        traverseEdges(cpNode, function(cpNode) {
            if (cpNode.isTerminating()) { return; }
            let bezier = cpNode.matCurveToNextVertex;
            if (!bezier) { return; }

            let $path = document.createElementNS(NS, 'path');
            $path.setAttributeNS(
                null, 
                "d", 
                fs[bezier.length](bezier)
            );
            $path.setAttributeNS(null, "class", type);

            svg.appendChild($path);
        });
    }
}


main();
