import { WinWheelDefautOption, OndoWheelOption } from './options/owheel.option';
import { TweenMax } from 'gsap';
export class OndoWheel {
    canvasId?: string;
    centerX?: number;
    centerY?: number;
    outerRadius?: number;
    innerRadius?: number;
    numSegments?: number;
    drawMode?: string;
    rotationAngle?: number;
    textFontFamily?: string;
    textFontSize?: number;
    textFontWeight?: string;
    textOrientation?: string;
    textAlignment?: string;
    textDirection?: string;
    textMargin;
    textFillStyle?: string;
    textStrokeStyle;
    textLineWidth?: number;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    clearTheCanvas?: boolean;
    imageOverlay?: boolean;
    drawText?: boolean;
    pointerAngle?: number;
    wheelImage;
    imageDirection?: string;
    canvas;
    ctx;
    segments = [];
    animation = {} as any;
    pins;
    pointerGuide = {} as any;
    private options: OndoWheelOption;
    constructor(settingOption: OndoWheelOption, drawWheel) {
        this.options = { ...WinWheelDefautOption, ...settingOption};
        for (const key in this.options) {
            if ((this.options != null) && (typeof (this.options[key]) !== 'undefined')) {
                this[key] = this.options[key];
            }
        }
        if (this.canvasId) {
            this.canvas = document.getElementById(this.canvasId);
            if (this.canvas) {
                if (this.centerX === null) {
                    this.centerX = this.canvas.width / 2;
                }
                if (this.centerY === null) {
                    this.centerY = this.canvas.height / 2;
                }
                if (this.outerRadius === null) {
                    if (this.canvas.width < this.canvas.height) {
                        this.outerRadius = (this.canvas.width / 2) - this.lineWidth;
                    }
                    else {
                        this.outerRadius = (this.canvas.height / 2) - this.lineWidth;
                    }
                }
                this.ctx = this.canvas.getContext('2d');
            }
            else {
                this.canvas = null;
                this.ctx = null;
            }
        }
        else {
            this.canvas = null;
            this.ctx = null;
        }
        (this.segments as Array<any>) = new Array<any>();
        const test = new Segment(this.options.segments[0]);
        this.segments.push(test);
        for (let x = 1; x <= this.numSegments; x++) {
            if ((this.options != null) && (this.options.segments) && (typeof (this.options.segments[x - 1]) !== 'undefined')) {
                const seg = new Segment(this.options.segments[x - 1]);
                this.segments.push(seg);
            }
            else {
                this.segments[x] = new Segment(null);
            }
        }
        this.updateSegmentSizes();
        if (this.textMargin === null) {
            this.textMargin = (this.textFontSize / 1.7);
        }
        if ((this.options !== null) && (this.options.animation) && (typeof (this.options.animation) !== 'undefined')) {
            this.animation = new Animation(this.options.animation);
        }
        else {
            this.animation = new Animation(null);
        }
        if ((this.options != null) && (this.options.pins) && (typeof (this.options.pins) !== 'undefined')) {
            this.pins = new Pin(this.options.pins);
        }
        if ((this.drawMode === 'image') || (this.drawMode === 'segmentImage')) {
            if (typeof (this.options.fillStyle) === 'undefined') {
                this.fillStyle = null;
            }
            if (typeof (this.options.strokeStyle) === 'undefined') {
                this.strokeStyle = 'red';
            }
            if (typeof (this.options.drawText) === 'undefined') {
                this.drawText = false;
            }
            if (typeof (this.options.lineWidth) === 'undefined') {
                this.lineWidth = 1;
            }
            if (typeof (drawWheel) === 'undefined') {
                drawWheel = false;
            }
        }
        else {
            if (typeof (drawWheel) === 'undefined') {
                drawWheel = true;
            }
        }
        if ((this.options != null) && (this.options.pointerGuide) && (typeof (this.options.pointerGuide) !== 'undefined')) {
            this.pointerGuide = new PointerGuide(this.options.pointerGuide);
        }
        else {
            this.pointerGuide = new PointerGuide(null);
        }
        if (drawWheel === true) {
            this.draw(this.clearTheCanvas);
        }
        else if (this.drawMode === 'segmentImage') {
            winwheelToDrawDuringAnimation = this;
            winhweelAlreadyDrawn = false;
            for (let y = 1; y <= this.numSegments; y++) {
                if (this.segments[y].image !== null) {
                    this.segments[y].imgData = new Image();
                    this.segments[y].imgData.onload = winwheelLoadedImage();
                    this.segments[y].imgData.src = this.segments[y].image;
                    console.log(this.segments[y].image);
                }
            }
        }
        this.draw(undefined);
    }
    updateSegmentSizes() {
        if (this.segments) {
            let arcUsed = 0;
            let numSet = 0;
            for (let x = 1; x <= this.numSegments; x++) {
                if (this.segments[x].size !== null && this.segments[x].size !== undefined) {
                    arcUsed += this.segments[x].size;
                    numSet++;
                }
            }
            const arcLeft = (360 - arcUsed);
            let degreesEach = 0;
            if (arcLeft > 0) {
                degreesEach = (arcLeft / (this.numSegments - numSet));
            }
            let currentDegree = 0;
            for (let x = 1; x <= this.numSegments; x++) {
                this.segments[x].startAngle = currentDegree;
                if (this.segments[x].size) {
                    currentDegree += this.segments[x].size;
                }
                else {
                    currentDegree += degreesEach;
                }
                this.segments[x].endAngle = currentDegree;
            }
        }
    }
    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    draw(clearTheCanvas) {
        if (this.ctx) {
            if (typeof (clearTheCanvas) !== 'undefined') {
                if (clearTheCanvas === true) {
                    this.clearCanvas();
                }
            }
            else {
                this.clearCanvas();
            }
            if (this.drawMode === 'image') {
                this.drawWheelImage();
                if (this.drawText === true) {
                    this.drawSegmentText();
                }
                if (this.imageOverlay === true) {
                    this.drawSegments();
                }
            }
            else if (this.drawMode === 'segmentImage') {
                this.drawSegmentImages();
                if (this.drawText === true) {
                    this.drawSegmentText();
                }
                if (this.imageOverlay === true) {
                    this.drawSegments();
                }
            }
            else {
                this.drawSegments();
                if (this.drawText === true) {
                    this.drawSegmentText();
                }
            }
            if (typeof this.pins !== 'undefined') {
                if (this.pins.visible === true) {
                    this.drawPins();
                }
            }
            if (this.pointerGuide.display === true && this.pointerGuide.display !== undefined) {
                this.drawPointerGuide();
            }
        }
    }
    drawPins() {
        if ((this.pins) && (this.pins.number)) {
            const pinSpacing = (360 / this.pins.number);
            for (let i = 1; i <= this.pins.number; i++) {
                this.ctx.save();
                this.ctx.strokeStyle = this.pins.strokeStyle;
                this.ctx.lineWidth = this.pins.lineWidth;
                this.ctx.fillStyle = this.pins.fillStyle;
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(this.degToRad(i * pinSpacing + this.rotationAngle));
                this.ctx.translate(-this.centerX, -this.centerY);
                this.ctx.beginPath();
                // tslint:disable-next-line: max-line-length
                this.ctx.arc(this.centerX, (this.centerY - this.outerRadius) + this.pins.outerRadius + this.pins.margin, this.pins.outerRadius, 0, 2 * Math.PI);
                if (this.pins.fillStyle) {
                    this.ctx.fill();
                }
                if (this.pins.strokeStyle) {
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        }
    }
    drawPointerGuide() {
        if (this.ctx) {
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(this.degToRad(this.pointerAngle));
            this.ctx.translate(-this.centerX, -this.centerY);
            this.ctx.strokeStyle = this.pointerGuide.strokeStyle;
            this.ctx.lineWidth = this.pointerGuide.lineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(this.centerX, -(this.outerRadius / 4));
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    drawWheelImage() {
        if (this.wheelImage != null) {
            const imageLeft = (this.centerX - (this.wheelImage.height / 2));
            const imageTop = (this.centerY - (this.wheelImage.width / 2));
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(this.degToRad(this.rotationAngle));
            this.ctx.translate(-this.centerX, -this.centerY);
            this.ctx.drawImage(this.wheelImage, imageLeft, imageTop);
            this.ctx.restore();
        }
    }
    drawSegmentImages() {
        if (this.ctx) {
            if (this.segments) {
                for (let x = 1; x <= this.numSegments; x++) {
                    const seg = this.segments[x];
                    if (seg.imgData.height) {
                        let imageLeft = 0;
                        let imageTop = 0;
                        let imageAngle = 0;
                        let imageDirection = '';
                        if (seg.imageDirection !== null) {
                            imageDirection = seg.imageDirection;
                        }
                        else {
                            imageDirection = this.imageDirection;
                        }
                        if (imageDirection === 'S') {
                            imageLeft = (this.centerX - (seg.imgData.width / 2));
                            imageTop = this.centerY;
                            imageAngle = (seg.startAngle + 180 + ((seg.endAngle - seg.startAngle) / 2));
                        }
                        else if (imageDirection === 'E') {
                            imageLeft = this.centerX;
                            imageTop = (this.centerY - (seg.imgData.height / 2));
                            imageAngle = (seg.startAngle + 270 + ((seg.endAngle - seg.startAngle) / 2));
                        }
                        else if (imageDirection === 'W') {
                            imageLeft = (this.centerX - seg.imgData.width);
                            imageTop = (this.centerY - (seg.imgData.height / 2));
                            imageAngle = (seg.startAngle + 90 + ((seg.endAngle - seg.startAngle) / 2));
                        }
                        else {
                            imageLeft = (this.centerX - (seg.imgData.width / 2));
                            imageTop = (this.centerY - seg.imgData.height);
                            imageAngle = (seg.startAngle + ((seg.endAngle - seg.startAngle) / 2));
                        }
                        this.ctx.save();
                        this.ctx.translate(this.centerX, this.centerY);
                        this.ctx.rotate(this.degToRad(this.rotationAngle + imageAngle));
                        this.ctx.translate(-this.centerX, -this.centerY);
                        this.ctx.drawImage(seg.imgData, imageLeft, imageTop);
                        this.ctx.restore();
                    }
                    else {
                        console.log('Segment ' + x + ' imgData is not loaded');
                    }
                }
            }
        }
    }
    drawSegments() {
        if (this.ctx) {
            if (this.segments) {
                for (let x = 1; x <= this.numSegments; x++) {
                    const seg = this.segments[x];
                    let fillStyle;
                    let lineWidth;
                    let strokeStyle;
                    if (seg.fillStyle !== null) {
                        fillStyle = seg.fillStyle;
                    }
                    else {
                        fillStyle = this.fillStyle;
                    }
                    this.ctx.fillStyle = fillStyle;
                    if (seg.lineWidth !== null) {
                        lineWidth = seg.lineWidth;
                    }
                    else {
                        lineWidth = this.lineWidth;
                    }
                    this.ctx.lineWidth = lineWidth;
                    if (seg.strokeStyle !== null) {
                        strokeStyle = seg.strokeStyle;
                    }
                    else {
                        strokeStyle = this.strokeStyle;
                    }
                    this.ctx.strokeStyle = strokeStyle;
                    if ((strokeStyle) || (fillStyle)) {
                        this.ctx.beginPath();
                        if (!this.innerRadius) {
                            this.ctx.moveTo(this.centerX, this.centerY);
                        }
                        else {
                        }
                        this.ctx.arc(this.centerX, this.centerY, this.outerRadius, this.degToRad(seg.startAngle + this.rotationAngle - 90), this.degToRad(seg.endAngle + this.rotationAngle - 90), false);
                        if (this.innerRadius) {
                            this.ctx.arc(this.centerX, this.centerY, this.innerRadius, this.degToRad(seg.endAngle + this.rotationAngle - 90), this.degToRad(seg.startAngle + this.rotationAngle - 90), true);
                        }
                        else {
                            this.ctx.lineTo(this.centerX, this.centerY);
                        }
                        if (fillStyle) {
                            this.ctx.fill();
                        }
                        if (strokeStyle) {
                            this.ctx.stroke();
                        }
                    }
                }
            }
        }
    }
    drawSegmentText() {
        if (this.ctx) {
            let fontFamily;
            let fontSize;
            let fontWeight;
            let orientation;
            let alignment;
            let direction;
            let margin;
            let fillStyle;
            let strokeStyle;
            let lineWidth;
            let fontSetting;
            for (let x = 1; x <= this.numSegments; x++) {
                this.ctx.save();
                const seg = this.segments[x];
                if (seg.text) {
                    if (seg.textFontFamily !== null) { fontFamily = seg.textFontFamily; } else { fontFamily = this.textFontFamily; }
                    if (seg.textFontSize !== null) { fontSize = seg.textFontSize; } else { fontSize = this.textFontSize; }
                    if (seg.textFontWeight !== null) { fontWeight = seg.textFontWeight; } else { fontWeight = this.textFontWeight; }
                    if (seg.textOrientation !== null) { orientation = seg.textOrientation; } else { orientation = this.textOrientation; }
                    if (seg.textAlignment !== null) { alignment = seg.textAlignment; } else { alignment = this.textAlignment; }
                    if (seg.textDirection !== null) { direction = seg.textDirection; } else { direction = this.textDirection; }
                    if (seg.textMargin !== null) { margin = seg.textMargin; } else { margin = this.textMargin; }
                    if (seg.textFillStyle !== null) { fillStyle = seg.textFillStyle; } else { fillStyle = this.textFillStyle; }
                    if (seg.textStrokeStyle !== null) { strokeStyle = seg.textStrokeStyle; } else { strokeStyle = this.textStrokeStyle; }
                    if (seg.textLineWidth !== null) { lineWidth = seg.textLineWidth; } else { lineWidth = this.textLineWidth; }
                    fontSetting = '';
                    if (fontWeight != null) {
                        fontSetting += fontWeight + ' ';
                    }
                    if (fontSize != null) {
                        fontSetting += fontSize + 'px ';
                    }
                    if (fontFamily != null) {
                        fontSetting += fontFamily;
                    }
                    this.ctx.font = fontSetting;
                    this.ctx.fillStyle = fillStyle;
                    this.ctx.strokeStyle = strokeStyle;
                    this.ctx.lineWidth = lineWidth;
                    const lines = seg.text.split('\n');
                    let lineOffset = 0 - (fontSize * (lines.length / 2)) + (fontSize / 2);
                    if ((orientation === 'curved') && ((alignment === 'inner') || (alignment === 'outer'))) {
                        lineOffset = 0;
                    }
                    // tslint:disable-next-line: prefer-for-of
                    for (let i = 0; i < lines.length; i++) {
                        if (direction === 'reversed') {
                            if (orientation === 'horizontal') {
                                if (alignment === 'inner') {
                                    this.ctx.textAlign = 'right';
                                }
                                else if (alignment === 'outer') {
                                    this.ctx.textAlign = 'left';
                                }
                                else {
                                    this.ctx.textAlign = 'center';
                                }
                                this.ctx.textBaseline = 'middle';
                                // tslint:disable-next-line: max-line-length
                                const textAngle = this.degToRad((seg.endAngle - ((seg.endAngle - seg.startAngle) / 2) + this.rotationAngle - 90) - 180);
                                this.ctx.save();
                                this.ctx.translate(this.centerX, this.centerY);
                                this.ctx.rotate(textAngle);
                                this.ctx.translate(-this.centerX, -this.centerY);
                                if (alignment === 'inner') {
                                    if (fillStyle) {
                                        this.ctx.fillText(lines[i], this.centerX - this.innerRadius - margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        this.ctx.strokeText(lines[i], this.centerX - this.innerRadius - margin, this.centerY + lineOffset);
                                    }
                                }
                                else if (alignment === 'outer') {
                                    if (fillStyle) {
                                        this.ctx.fillText(lines[i], this.centerX - this.outerRadius + margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        this.ctx.strokeText(lines[i], this.centerX - this.outerRadius + margin, this.centerY + lineOffset);
                                    }
                                }
                                else {
                                    if (fillStyle) {
                                        // tslint:disable-next-line: max-line-length
                                        this.ctx.fillText(lines[i], this.centerX - this.innerRadius - ((this.outerRadius - this.innerRadius) / 2) - margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        // tslint:disable-next-line: max-line-length
                                        this.ctx.strokeText(lines[i], this.centerX - this.innerRadius - ((this.outerRadius - this.innerRadius) / 2) - margin, this.centerY + lineOffset);
                                    }
                                }
                                this.ctx.restore();
                            }
                            else if (orientation === 'vertical') {
                                this.ctx.textAlign = 'center';
                                const centerAdjustment = 0;
                                // tslint:disable-next-line: max-line-length
                                let yPos = (this.centerY + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2)) + centerAdjustment + margin;
                                if (alignment === 'inner') {
                                    this.ctx.textBaseline = 'top';
                                }
                                else if (alignment === 'outer') {
                                    this.ctx.textBaseline = 'bottom';
                                }
                                else {
                                    this.ctx.textBaseline = 'middle';
                                }
                                let textAngle = (seg.endAngle - ((seg.endAngle - seg.startAngle) / 2) - 180);
                                textAngle += this.rotationAngle;
                                this.ctx.save();
                                this.ctx.translate(this.centerX, this.centerY);
                                this.ctx.rotate(this.degToRad(textAngle));
                                this.ctx.translate(-this.centerX, -this.centerY);
                                if (alignment === 'outer') {
                                    yPos = (this.centerY + this.outerRadius - margin);
                                }
                                else if (alignment === 'inner') {
                                    yPos = (this.centerY + this.innerRadius + margin);
                                }
                                const yInc = (fontSize - (fontSize / 9));
                                if (alignment === 'outer') {
                                    for (let c = (lines[i].length - 1); c >= 0; c--) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos -= yInc;
                                    }
                                }
                                else if (alignment === 'inner') {

                                    // tslint:disable-next-line: max-line-length
                                    let yPos = (this.centerY + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2)) + centerAdjustment + margin;
                                    for (let c = 0; c < lines[i].length; c++) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos += yInc;
                                    }
                                }
                                else if (alignment === 'center') {
                                    let centerAdjustment = 0;
                                    if (lines[i].length > 1) {
                                        centerAdjustment = (yInc * (lines[i].length - 1) / 2);
                                    }
                                    // tslint:disable-next-line: max-line-length
                                    let yPos = (this.centerY + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2)) + centerAdjustment + margin;
                                    for (let c = (lines[i].length - 1); c >= 0; c--) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos -= yInc;
                                    }
                                }
                                this.ctx.restore();
                            }
                            else if (orientation === 'curved') {
                                let radius = 0;
                                if (alignment === 'inner') {
                                    radius = this.innerRadius + margin;
                                    this.ctx.textBaseline = 'top';
                                }
                                else if (alignment === 'outer') {
                                    radius = this.outerRadius - margin;
                                    this.ctx.textBaseline = 'bottom';
                                    radius -= (fontSize * (lines.length - 1));
                                }
                                else if (alignment === 'center') {
                                    radius = this.innerRadius + margin + ((this.outerRadius - this.innerRadius) / 2);
                                    this.ctx.textBaseline = 'middle';
                                }
                                let anglePerChar = 0;
                                let drawAngle = 0;
                                if (lines[i].length > 1) {
                                    this.ctx.textAlign = 'left';
                                    anglePerChar = (4 * (fontSize / 10));
                                    const radiusPercent = (100 / radius);
                                    anglePerChar = (anglePerChar * radiusPercent);
                                    const totalArc = (anglePerChar * lines[i].length);
                                    drawAngle = seg.startAngle + (((seg.endAngle - seg.startAngle) / 2) - (totalArc / 2));
                                }
                                else {
                                    drawAngle = (seg.startAngle + ((seg.endAngle - seg.startAngle) / 2));
                                    this.ctx.textAlign = 'center';
                                }
                                drawAngle += this.rotationAngle;
                                drawAngle -= 180;
                                for (let c = lines[i].length; c >= 0; c--) {
                                    this.ctx.save();
                                    const character = lines[i].charAt(c);
                                    this.ctx.translate(this.centerX, this.centerY);
                                    this.ctx.rotate(this.degToRad(drawAngle));
                                    this.ctx.translate(-this.centerX, -this.centerY);
                                    if (strokeStyle) {
                                        this.ctx.strokeText(character, this.centerX, this.centerY + radius + lineOffset);
                                    }
                                    if (fillStyle) {
                                        this.ctx.fillText(character, this.centerX, this.centerY + radius + lineOffset);
                                    }
                                    drawAngle += anglePerChar;
                                    this.ctx.restore();
                                }
                            }
                        }
                        else {
                            if (orientation === 'horizontal') {
                                if (alignment === 'inner') {
                                    this.ctx.textAlign = 'left';
                                }
                                else if (alignment === 'outer') {
                                    this.ctx.textAlign = 'right';
                                }
                                else {
                                    this.ctx.textAlign = 'center';
                                }
                                this.ctx.textBaseline = 'middle';
                                // tslint:disable-next-line: max-line-length
                                const textAngle = this.degToRad(seg.endAngle - ((seg.endAngle - seg.startAngle) / 2) + this.rotationAngle - 90);
                                this.ctx.save();
                                this.ctx.translate(this.centerX, this.centerY);
                                this.ctx.rotate(textAngle);
                                this.ctx.translate(-this.centerX, -this.centerY);
                                if (alignment === 'inner') {
                                    if (fillStyle) {
                                        this.ctx.fillText(lines[i], this.centerX + this.innerRadius + margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        this.ctx.strokeText(lines[i], this.centerX + this.innerRadius + margin, this.centerY + lineOffset);
                                    }
                                }
                                else if (alignment === 'outer') {
                                    if (fillStyle) {
                                        this.ctx.fillText(lines[i], this.centerX + this.outerRadius - margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        this.ctx.strokeText(lines[i], this.centerX + this.outerRadius - margin, this.centerY + lineOffset);
                                    }
                                }
                                else {
                                    if (fillStyle) {
                                        this.ctx.fillText(lines[i], this.centerX + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2) + margin, this.centerY + lineOffset);
                                    }
                                    if (strokeStyle) {
                                        this.ctx.strokeText(lines[i], this.centerX + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2) + margin, this.centerY + lineOffset);
                                    }
                                }
                                this.ctx.restore();
                            }
                            else if (orientation === 'vertical') {
                                const centerAdjustment = 0;
                                let yPos = (this.centerY + this.innerRadius + ((this.outerRadius - this.innerRadius) / 2)) + centerAdjustment + margin;
                                this.ctx.textAlign = 'center';
                                if (alignment === 'inner') {
                                    this.ctx.textBaseline = 'bottom';
                                }
                                else if (alignment === 'outer') {
                                    this.ctx.textBaseline = 'top';
                                }
                                else {
                                    this.ctx.textBaseline = 'middle';
                                }
                                let textAngle = seg.endAngle - ((seg.endAngle - seg.startAngle) / 2);
                                textAngle += this.rotationAngle;
                                this.ctx.save();
                                this.ctx.translate(this.centerX, this.centerY);
                                this.ctx.rotate(this.degToRad(textAngle));
                                this.ctx.translate(-this.centerX, -this.centerY);
                                if (alignment === 'outer') {
                                    yPos = (this.centerY - this.outerRadius + margin);
                                }
                                else if (alignment === 'inner') {
                                    yPos = (this.centerY - this.innerRadius - margin);
                                }
                                const yInc = (fontSize - (fontSize / 9));
                                if (alignment === 'outer') {
                                    for (let c = 0; c < lines[i].length; c++) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos += yInc;
                                    }
                                }
                                else if (alignment === 'inner') {
                                    for (let c = (lines[i].length - 1); c >= 0; c--) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos -= yInc;
                                    }
                                }
                                else if (alignment === 'center') {
                                    // tslint:disable-next-line: no-shadowed-variable
                                    let centerAdjustment = 0;
                                    if (lines[i].length > 1) {
                                        centerAdjustment = (yInc * (lines[i].length - 1) / 2);
                                    }
                                    // tslint:disable-next-line: max-line-length  // tslint:disable-next-line: no-shadowed-variable
                                    let yPos = (this.centerY - this.innerRadius - ((this.outerRadius - this.innerRadius) / 2)) - centerAdjustment - margin;
                                    for (let c = 0; c < lines[i].length; c++) {
                                        const character = lines[i].charAt(c);
                                        if (fillStyle) {
                                            this.ctx.fillText(character, this.centerX + lineOffset, yPos);
                                        }
                                        if (strokeStyle) {
                                            this.ctx.strokeText(character, this.centerX + lineOffset, yPos);
                                        }
                                        yPos += yInc;
                                    }
                                }
                                this.ctx.restore();
                            }
                            else if (orientation === 'curved') {
                                let radius = 0;
                                if (alignment === 'inner') {
                                    radius = this.innerRadius + margin;
                                    this.ctx.textBaseline = 'bottom';
                                    radius += (fontSize * (lines.length - 1));
                                }
                                else if (alignment === 'outer') {
                                    radius = this.outerRadius - margin;
                                    this.ctx.textBaseline = 'top';
                                }
                                else if (alignment === 'center') {
                                    radius = this.innerRadius + margin + ((this.outerRadius - this.innerRadius) / 2);
                                    this.ctx.textBaseline = 'middle';
                                }
                                let anglePerChar = 0;
                                let drawAngle = 0;
                                if (lines[i].length > 1) {
                                    this.ctx.textAlign = 'left';
                                    anglePerChar = (4 * (fontSize / 10));
                                    const radiusPercent = (100 / radius);
                                    anglePerChar = (anglePerChar * radiusPercent);
                                    const totalArc = (anglePerChar * lines[i].length);
                                    drawAngle = seg.startAngle + (((seg.endAngle - seg.startAngle) / 2) - (totalArc / 2));
                                }
                                else {
                                    drawAngle = (seg.startAngle + ((seg.endAngle - seg.startAngle) / 2));
                                    this.ctx.textAlign = 'center';
                                }
                                drawAngle += this.rotationAngle;
                                for (let c = 0; c < (lines[i].length); c++) {
                                    this.ctx.save();
                                    const character = lines[i].charAt(c);
                                    this.ctx.translate(this.centerX, this.centerY);
                                    this.ctx.rotate(this.degToRad(drawAngle));
                                    this.ctx.translate(-this.centerX, -this.centerY);
                                    if (strokeStyle) {
                                        this.ctx.strokeText(character, this.centerX, this.centerY - radius + lineOffset);
                                    }
                                    if (fillStyle) {
                                        this.ctx.fillText(character, this.centerX, this.centerY - radius + lineOffset);
                                    }
                                    drawAngle += anglePerChar;
                                    this.ctx.restore();
                                }
                            }
                        }
                        lineOffset += fontSize;
                    }
                }
                this.ctx.restore();
            }
        }
    }
    degToRad(d) {
        return d * 0.0174532925199432957;
    }
    setCenter(x, y) {
        this.centerX = x;
        this.centerY = y;
    }
    addSegment = function(options, position) {
        const newSegment = new Segment(options);
        this.numSegments++;
        let segmentPos;
        if (typeof position !== 'undefined') {
            for (let x = this.numSegments; x > position; x--) {
                this.segments[x] = this.segments[x - 1];
            }
            this.segments[position] = newSegment;
            segmentPos = position;
        }
        else {
            this.segments[this.numSegments] = newSegment;
            segmentPos = this.numSegments;
        }
        this.updateSegmentSizes();
        return this.segments[segmentPos];
    };
    setCanvasId(canvasId) {
        if (canvasId) {
            this.canvasId = canvasId;
            this.canvas = document.getElementById(this.canvasId);
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
            }
        }
        else {
            this.canvasId = null;
            this.ctx = null;
            this.canvas = null;
        }
    }
    deleteSegment(position) {
        if (this.numSegments > 1) {
            if (typeof position !== 'undefined') {
                for (let x = position; x < this.numSegments; x++) {
                    this.segments[x] = this.segments[x + 1];
                }
            }
            this.segments[this.numSegments] = undefined;
            this.numSegments--;
            this.updateSegmentSizes();
        }
    }
    windowToCanvas = function(x, y) {
        const bbox = this.canvas.getBoundingClientRect();
        return {
            x: Math.floor(x - bbox.left * (this.canvas.width / bbox.width)),
            y: Math.floor(y - bbox.top * (this.canvas.height / bbox.height))
        };
    };
    getSegmentAt(x, y) {
        let foundSegment = null;
        const segmentNumber = this.getSegmentNumberAt(x, y);
        if (segmentNumber !== null) {
            foundSegment = this.segments[segmentNumber];
        }
        return foundSegment;
    }
    getSegmentNumberAt(x, y) {
        const loc = this.windowToCanvas(x, y);
        let topBottom;
        let leftRight;
        let adjacentSideLength;
        let oppositeSideLength;
        let hypotenuseSideLength;
        if (loc.x > this.centerX) {
            adjacentSideLength = (loc.x - this.centerX);
            leftRight = 'R';
        }
        else {
            adjacentSideLength = (this.centerX - loc.x);
            leftRight = 'L';
        }
        if (loc.y > this.centerY) {
            oppositeSideLength = (loc.y - this.centerY);
            topBottom = 'B';
        }
        else {
            oppositeSideLength = (this.centerY - loc.y);
            topBottom = 'T';
        }
        const tanVal = oppositeSideLength / adjacentSideLength;
        const result = (Math.atan(tanVal) * 180 / Math.PI);
        let locationAngle = 0;
        hypotenuseSideLength = Math.sqrt((oppositeSideLength * oppositeSideLength) + (adjacentSideLength * adjacentSideLength));
        if ((topBottom === 'T') && (leftRight === 'R')) {
            locationAngle = Math.round(90 - result);
        }
        else if ((topBottom === 'B') && (leftRight === 'R')) {
            locationAngle = Math.round(result + 90);
        }
        else if ((topBottom === 'B') && (leftRight === 'L')) {
            locationAngle = Math.round((90 - result) + 180);
        }
        else if ((topBottom === 'T') && (leftRight === 'L')) {
            locationAngle = Math.round(result + 270);
        }
        if (this.rotationAngle != 0) {
            const rotatedPosition = this.getRotationPosition();
            locationAngle = (locationAngle - rotatedPosition);
            if (locationAngle < 0) {
                locationAngle = (360 - Math.abs(locationAngle));
            }
        }
        let foundSegmentNumber = null;
        for (let x = 1; x <= this.numSegments; x++) {
            if ((locationAngle >= this.segments[x].startAngle) && (locationAngle <= this.segments[x].endAngle)) {
                if ((hypotenuseSideLength >= this.innerRadius) && (hypotenuseSideLength <= this.outerRadius)) {
                    foundSegmentNumber = x;
                    break;
                }
            }
        }
        return foundSegmentNumber;
    }
    getIndicatedSegment() {
        const prizeNumber = this.getIndicatedSegmentNumber();
        return this.segments[prizeNumber];
    }
    getIndicatedSegmentNumber() {
        let indicatedPrize = 0;
        const rawAngle = this.getRotationPosition();
        let relativeAngle = Math.floor(this.pointerAngle - rawAngle);
        if (relativeAngle < 0) {
            relativeAngle = 360 - Math.abs(relativeAngle);
        }
        for (let x = 1; x < (this.segments.length); x++) {
            if ((relativeAngle >= this.segments[x].startAngle) && (relativeAngle <= this.segments[x].endAngle)) {
                indicatedPrize = x;
                break;
            }
        }
        return indicatedPrize;
    }
    getRotationPosition() {
        let rawAngle = this.rotationAngle;
        if (rawAngle >= 0) {
            if (rawAngle > 360) {
                const timesPast360 = Math.floor(rawAngle / 360);
                rawAngle = (rawAngle - (360 * timesPast360));
            }
        }
        else {
            if (rawAngle < -360) {
                const timesPast360 = Math.ceil(rawAngle / 360);
                rawAngle = (rawAngle - (360 * timesPast360));
            }
            rawAngle = (360 + rawAngle);
        }
        return rawAngle;
    }
    startAnimation = function() {
        if (this.animation) {
            this.computeAnimation();
            winwheelToDrawDuringAnimation = this;
            const properties = {} as any;
            properties[this.animation.propertyName] = this.animation.propertyValue;
            properties.yoyo = this.animation.yoyo;
            properties.repeat = this.animation.repeat;
            properties.ease = this.animation.easing;
            properties.onUpdate = winwheelAnimationLoop;
            properties.onComplete = winwheelStopAnimation;
            this.tween = TweenMax.to(this, this.animation.duration, properties);
        }
    };
    stopAnimation = function(canCallback) {
        if (winwheelToDrawDuringAnimation) {
            winwheelToDrawDuringAnimation.tween.kill();
            winwheelStopAnimation(canCallback);
        }
        winwheelToDrawDuringAnimation = this;
    };
    pauseAnimation = function() {
        if (this.tween) {
            this.tween.pause();
        }
    };
    resumeAnimation = function() {
        if (this.tween) {
            this.tween.play();
        }
    };
    computeAnimation = function() {
        if (this.animation) {
            if (this.animation.type === 'spinOngoing') {
                this.animation.propertyName = 'rotationAngle';
                if (this.animation.spins === null) {
                    this.animation.spins = 5;
                }
                if (this.animation.repeat === null) {
                    this.animation.repeat = -1;
                }
                if (this.animation.easing === null) {
                    this.animation.easing = 'Linear.easeNone';
                }
                if (this.animation.yoyo === null) {
                    this.animation.yoyo = false;
                }
                this.animation.propertyValue = (this.animation.spins * 360);
                if (this.animation.direction === 'anti-clockwise') {
                    this.animation.propertyValue = (0 - this.animation.propertyValue);
                }
            }
            else if (this.animation.type === 'spinToStop') {
                this.animation.propertyName = 'rotationAngle';
                if (this.animation.spins === null) {
                    this.animation.spins = 5;
                }
                if (this.animation.repeat === null) {
                    this.animation.repeat = 0;
                }
                if (this.animation.easing === null) {
                    this.animation.easing = 'Power4.easeOut';
                }
                if (this.animation.stopAngle === null) {
                    this.animation._stopAngle = Math.floor((Math.random() * 359));
                }
                else {
                    this.animation._stopAngle = (360 - this.animation.stopAngle + this.pointerAngle);
                }
                if (this.animation.yoyo === null) {
                    this.animation.yoyo = false;
                }
                this.animation.propertyValue = (this.animation.spins * 360);
                if (this.animation.direction === 'anti-clockwise') {
                    this.animation.propertyValue = (0 - this.animation.propertyValue);
                    this.animation.propertyValue -= (360 - this.animation._stopAngle);
                }
                else {
                    this.animation.propertyValue += this.animation._stopAngle;
                }
            }
            else if (this.animation.type === 'spinAndBack') {
                this.animation.propertyName = 'rotationAngle';
                if (this.animation.spins === null) {
                    this.animation.spins = 5;
                }
                if (this.animation.repeat === null) {
                    this.animation.repeat = 1;
                }
                if (this.animation.easing === null) {
                    this.animation.easing = 'Power2.easeInOut';
                }
                if (this.animation.yoyo === null) {
                    this.animation.yoyo = true;
                }
                if (this.animation.stopAngle === null) {
                    this.animation._stopAngle = 0;
                }
                else {
                    this.animation._stopAngle = (360 - this.animation.stopAngle);
                }
                this.animation.propertyValue = (this.animation.spins * 360);
                if (this.animation.direction === 'anti-clockwise') {
                    this.animation.propertyValue = (0 - this.animation.propertyValue);
                    this.animation.propertyValue -= (360 - this.animation._stopAngle);
                }
                else {
                    this.animation.propertyValue += this.animation._stopAngle;
                }
            }
            else if (this.animation.type === 'custom') {
            }
        }
    };
    getRandomForSegment = function(segmentNumber) {
        let stopAngle = 0;
        if (segmentNumber) {
            if (typeof this.segments[segmentNumber] !== 'undefined') {
                const startAngle = this.segments[segmentNumber].startAngle;
                const endAngle = this.segments[segmentNumber].endAngle;
                const range = (endAngle - startAngle) - 2;
                if (range > 0) {
                    stopAngle = (startAngle + 1 + Math.floor((Math.random() * range)));
                }
                else {
                    console.log('Segment size is too small to safely get random angle inside it');
                }
            }
            else {
                console.log('Segment ' + segmentNumber + ' undefined');
            }
        }
        else {
            console.log('Segment number not specified');
        }
        return stopAngle;
    };
}
class Pin {
    defaultOptions = {
        visible: true,
        number: 36,
        outerRadius: 3,
        fillStyle: 'grey',
        strokeStyle: 'black',
        lineWidth: 1,
        margin: 3,
    };
    constructor(private options) {
        for (const key in this.defaultOptions) {
            if ((options != null) && (typeof (this.options[key]) !== 'undefined')) {
                this[key] = options[key];
            }
            else {
                this[key] = this.defaultOptions[key];
            }
        }
        if (options != null) {
            for (const key in options) {
                if (typeof (this[key]) === 'undefined') {
                    this[key] = options[key];
                }
            }
        }
    }
}
class Animation {
    defaultOptions = {
        type: 'spinOngoing',
        direction: 'clockwise',
        propertyName: null,
        propertyValue: null,
        duration: 10,
        yoyo: false,
        repeat: 0,
        easing: 'power3.easeOut',
        stopAngle: null,
        spins: null,
        clearTheCanvas: null,
        callbackFinished: null,
        callbackBefore: null,
        callbackAfter: null
    };
    constructor(options) {
        for (const key in this.defaultOptions) {
            if ((options != null) && (typeof (options[key]) !== 'undefined')) {
                this[key] = options[key];
            }
            else {
                this[key] = this.defaultOptions[key];
            }
        }
        if (options != null) {
            for (const key in options) {
                if (typeof (this[key]) === 'undefined') {
                    this[key] = options[key];
                }
            }
        }
    }
}
class Segment {
    size: null;
    text: string;
    fillStyle: null;
    strokeStyle: null;
    lineWidth: null;
    textFontFamily: null;
    textFontSize: null;
    textFontWeight: null;
    textOrientation: null;
    textAlignment: null;
    textDirection: null;
    textMargin: null;
    textFillStyle: null;
    textStrokeStyle: null;
    textLineWidth: null;
    image: null;
    imageDirection: null;
    imgData: null;
    startAngle = 0;
    endAngle = 0;
    defaultOptions = {
        size: null,
        text: '',
        fillStyle: null,
        strokeStyle: null,
        lineWidth: null,
        textFontFamily: null,
        textFontSize: null,
        textFontWeight: null,
        textOrientation: null,
        textAlignment: null,
        textDirection: null,
        textMargin: null,
        textFillStyle: null,
        textStrokeStyle: null,
        textLineWidth: null,
        image: null,
        imageDirection: null,
        imgData: null
    };
    constructor(options) {
        for (const key in this.defaultOptions) {
            if ((options != null) && (typeof (options[key]) !== 'undefined')) {
                this[key] = options[key];
            }
            else {
                this[key] = this.defaultOptions[key];
            }
        }
        if (options != null) {
            for (const key in options) {
                if (typeof (this[key]) === 'undefined') {
                    this[key] = options[key];
                }
            }
        }
        this.startAngle = 0;
        this.endAngle = 0;
    }
    changeImage = function(image, imageDirection) {
        this.image = image;
        this.imgData = null;
        if (imageDirection) {
            this.imageDirection = imageDirection;
        }
        winhweelAlreadyDrawn = false;
        this.imgData = new Image();
        this.imgData.onload = winwheelLoadedImage;
        this.imgData.src = this.image;
    };
}
class PointerGuide {
    defaultOptions = {
        display: false,
        strokeStyle: 'red',
        lineWidth: 3
    };
    constructor(options) {
        for (const key in this.defaultOptions) {
            if ((options != null) && (typeof (options[key]) !== 'undefined')) {
                this[key] = options[key];
            }
            else {
                this[key] = this.defaultOptions[key];
            }
        }
    }
}
class winwheelPercentToDegrees {
    constructor(percentValue) {
        let degrees = 0;
        if ((percentValue > 0) && (percentValue <= 100)) {
            const divider = (percentValue / 100);
            degrees = (360 * divider);
        }
        return degrees;
    }
}
function winwheelAnimationLoop() {
    if (winwheelToDrawDuringAnimation) {
        if (winwheelToDrawDuringAnimation.animation.clearTheCanvas != false) {
            // tslint:disable-next-line: max-line-length
            winwheelToDrawDuringAnimation.ctx.clearRect(0, 0, winwheelToDrawDuringAnimation.canvas.width, winwheelToDrawDuringAnimation.canvas.height);
        }
        if (winwheelToDrawDuringAnimation.animation.callbackBefore != null) {
            // tslint:disable-next-line: no-eval
            eval(winwheelToDrawDuringAnimation.animation.callbackBefore);
        }
        winwheelToDrawDuringAnimation.draw(false);
        if (winwheelToDrawDuringAnimation.animation.callbackAfter != null) {
            eval(winwheelToDrawDuringAnimation.animation.callbackAfter);
        }
    }
}
let winwheelToDrawDuringAnimation = null;
function winwheelStopAnimation(canCallback) {
    if (canCallback !== false) {
        if (winwheelToDrawDuringAnimation.animation.callbackFinished != null) {
            eval(winwheelToDrawDuringAnimation.animation.callbackFinished);
        }
    }
}
let winhweelAlreadyDrawn = false;
function winwheelLoadedImage() {
    if (winhweelAlreadyDrawn === false) {
        let winwheelImageLoadCount = 0;
        for (let i = 1; i <= winwheelToDrawDuringAnimation.numSegments; i++) {
            if ((winwheelToDrawDuringAnimation.segments[i].imgData != null) && (winwheelToDrawDuringAnimation.segments[i].imgData.height)) {
                winwheelImageLoadCount++;
            }
        }
        if (winwheelImageLoadCount === winwheelToDrawDuringAnimation.numSegments) {
            winhweelAlreadyDrawn = true;
            winwheelToDrawDuringAnimation.draw();
        }
    }
}
