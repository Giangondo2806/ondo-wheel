
export interface OndoWheelOption {
    canvasId?: string;
    // Id of the canvas which the wheel is to draw on to.
    centerX?: number;
    // X position of the center of the wheel. The default of these are null which means will be placed in center of the canvas.
    centerY?: number;
    // Y position of the wheel center. If left null at time of construct the center of the canvas is used.
    outerRadius?: number;
    // The radius of the outside of the wheel. If left null it will be set to the radius from the center of the canvas to its shortest side.
    innerRadius?: number;
    // Normally 0. Allows the creation of rings / doughnuts if set to value > 0. Should not exceed outer radius.
    numSegments?: number;
    // The number of segments. Need at least one to draw.
    drawMode?: string;
    // The draw mode. Possible values are code; image; segmentImage.
    // Default is code which means segments are drawn using canvas arc() function.
    rotationAngle?: number;
    // The angle of rotation of the wheel - 0 is 12 oclock position.
    textFontFamily?: string;
    // Segment text font, you should use web safe fonts.
    textFontSize?: number;
    // Size of the segment text.
    textFontWeight?: string;
    // Font weight.
    textOrientation?: string;
    // Either horizontal, vertical, or curved.
    textAlignment?: string;
    // Either center, inner, or outer.
    textDirection?: string;
    // Either normal or reversed. In normal mode for horizontal text in segment at 3 oclock is correct way up,
    // in reversed text at 9 oclock segment is correct way up.
    textMargin?: number;
    // Margin between the inner or outer of the wheel (depends on textAlignment).
    textFillStyle?;
    // This is basically the text colour.
    textStrokeStyle?;
    // Basically the line colour for segment text, only looks good for large text so off by default.
    textLineWidth?: number;
    // Width of the lines around the text. Even though this defaults to 1, a line is only drawn if textStrokeStyle specified.
    fillStyle?: string;
    // The segment background colour.
    strokeStyle?: string;
    // Segment line colour. Again segment lines only drawn if this is specified.
    lineWidth?: number;
    // Width of lines around segments.
    clearTheCanvas?: boolean;
    // When set to true the canvas will be cleared before the wheel is drawn.
    imageOverlay?: boolean;
    // If set to true in image drawing mode the outline of the segments will be displayed over the image. Does nothing in code drawMode.
    drawText?: boolean;
    // By default the text of the segments is rendered in code drawMode and not in image drawMode.
    pointerAngle?: number;
    // Location of the pointer that indicates the prize when wheel has stopped. Default is 0 so the (corrected) 12 oclock position.
    wheelImage?;
    // Must be set to image data in order to use image to draw the wheel - drawMode must also be image.
    imageDirection?: string;
    animation?;
    segments?: {
    
    }[]
    pins?;
    pointerGuide?;
}

export const WinWheelDefautOption: OndoWheelOption = {
    canvasId: 'canvas',
    centerX: null,
    centerY: null,
    innerRadius: 0,
    numSegments: 1,
    drawMode: 'code',
    rotationAngle: 0,
    textFontFamily: 'Arial',
    textFontSize: 20,
    textFontWeight: 'bold',
    textAlignment: 'center',
    textDirection: 'normal',
    textMargin: null,
    textFillStyle: 'black',
    textStrokeStyle: null,
    textLineWidth: 1,
    fillStyle: 'silver',
    strokeStyle: 'black',
    lineWidth: 1,
    clearTheCanvas: true,
    imageOverlay: false,
    drawText: true,
    pointerAngle: 0,
    wheelImage: null,
    imageDirection: 'N',
    segments: []
};
