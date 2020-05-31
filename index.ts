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
    $e.setAttributeNS(null, 'viewBox', '0 -500 2000 2000');

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


/**
 * The SVG path string representing our shape.
 */
const svgPathStr = `
        M146 588c-64-19-85-35-85-63 0-43 50-158 133-304-34-1-63-2-80-2 8-20 47-34 108-45 105-174 240-320 349-379 1-9 2-16 2-19 37 0 138 44 143 62-44 77-90 237-118 450-7 53-12 121-12 205 0 29 0 60 2 93-3 1-4 1-12 1-37 0-107-27-114-44-1-17-1-34-1-52 0-82 6-168 20-258-37-3-129-7-213-10-32 59-61 120-81 179-22 63-37 130-41 186z
        M532-13c5-19 13-54 20-90-67 25-166 133-249 267 56-5 120-8 191-9 10-55 23-111 38-168z
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
      
    // We could also just give an array of linear, quadratic or cubic beziers as 
    // below (all lines in this case). Note that in the below case there is only
    // one array of beziers (forming a single loop shape).
    
    /*
    bezierLoops = [
        [
            [[50.000, 95.000],[92.797, 63.905]], 
            [[92.797, 63.905],[76.450, 13.594]],
            [[76.450, 13.594],[23.549, 13.594]],
            [[23.549, 13.594],[7.202,  63.90]],
            [[7.202,  63.900],[50.000, 95.000]]
        ]
    ];
    */
        
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
