import { avgPosition, distBetween, extendPosition } from "./point_util.js";

const segments = [
    {
        features: ["neck",
            "rightShoulder",
            "rightElbow", "rightWrist", "rightHand"],
    },
    {
        features: ["neck",
            "leftShoulder",
            "leftElbow", "leftWrist", "leftHand"],
    },
    {
        features: ["neck", "hip"],
    },
    {
        features: ["hip", "rightKnee", "rightAnkle", "rightFoot"],
    },
    {
        features: ["hip", "leftKnee", "leftAnkle", "leftFoot"],
    }
];

const debugSegments = [
    { features: ["nose", "leftEye", "leftEar"] },
    { features: ["nose", "rightEye", "rightEar"] },
    { features: ["nose", "neck"] },
    { features: ["leftShoulder", "neck", "rightShoulder"] },
    { features: ["leftShoulder", "leftElbow", "leftWrist", "leftHand"] },
    { features: ["rightShoulder", "rightElbow", "rightWrist", "rightHand"] },
    { features: ["leftShoulder", "leftHip", "hip"] },
    { features: ["rightShoulder", "rightHip", "hip"] },
    { features: ["neck", "hip"] },
    { features: ["leftHip", "leftKnee", "leftAnkle", "leftFoot"] },
    { features: ["rightHip", "rightKnee", "rightAnkle", "rightFoot"] },
];

function addSyntheticFeatures(features) {
    const syntheticFeatures = [
        {
            part: "neck",
            position:
                avgPosition(
                    avgPosition(features["leftShoulder"].position, features["rightShoulder"].position),
                    features["nose"].position,
                    1 / 3),
        },
        {
            part: "hip",
            position:
                avgPosition(features["leftHip"].position, features["rightHip"].position)
        },
        {
            part: "leftHand",
            position:
                extendPosition(features["leftElbow"].position, features["leftWrist"].position, 0.25),
        },
        {
            part: "rightHand",
            position:
                extendPosition(features["rightElbow"].position, features["rightWrist"].position, 0.25),
        },
        {
            part: "leftFoot",
            position:
                extendPosition(features["leftKnee"].position, features["leftAnkle"].position, 0.25),
        },
        {
            part: "rightFoot",
            position:
                extendPosition(features["rightKnee"].position, features["rightAnkle"].position, 0.25),
        }
    ];
    syntheticFeatures.forEach(feature => features[feature.part] = feature);
}

export function drawCircle(ctx, point, radius, fillColor = "black") {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    // ctx.strokeText(text, wrist.position.x, wrist.position.y);
    ctx.fillStyle = fillColor;
    ctx.fill();
}

export function drawLines(ctx, points, width, style = "black") {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.stroke();
}
export function drawLine(ctx, fromPoint, toPoint, width) {
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = width;
    ctx.stroke();
}

function paintPose(ctx, pose, toDrawPoint, toDrawScale, debugView = false) {
    const features =
        pose.keypoints.reduce((accum, c) => { accum[c.part] = c; return accum; }, {});
    addSyntheticFeatures(features);

    if (debugView) {
        const circleRadius = toDrawScale(5);
        Object.values(features)
            .map(feature => feature.position)
            .map(toDrawPoint)
            .forEach(p => {
                drawCircle(ctx, p, circleRadius, "red");
            });
        const lineWidth = toDrawScale(5);
        debugSegments.forEach(segment => {
            const points = segment.features
                .map(feature => features[feature].position)
                .map(toDrawPoint);
            drawLines(ctx, points, lineWidth, "#00ff00");
        });
        return;
    }

    const lineWidth = toDrawScale(20);
    segments.forEach(segment => {
        const points = segment.features
            .map(feature => toDrawPoint(features[feature].position));
        drawLines(ctx, points, lineWidth);
    });
    // Draw face
    drawCircle(ctx,
        toDrawPoint(features["nose"].position),
        Math.ceil(distBetween(toDrawPoint(features["nose"].position), toDrawPoint(features["neck"].position))));
}

export default function paintFrame(ctx, frame, backgroundOpacity = 1, debugView = false) {
    // Compute scaling
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    const videoWidth = frame.videoWidth;
    const videoHeight = frame.videoHeight;
    let xOffset = 0;
    let yOffset = 0;
    const videoWidthInDrawCoords = videoWidth / videoHeight * drawHeight;
    const videoHeightInDrawCoords = videoHeight / videoWidth * drawWidth;
    if (drawWidth > videoWidthInDrawCoords) {
        xOffset = Math.floor((drawWidth - videoWidthInDrawCoords) / 2);
        drawWidth = videoWidthInDrawCoords;
    } else if (drawHeight > videoHeightInDrawCoords) {
        yOffset = Math.floor((drawHeight - videoHeightInDrawCoords) / 2);
        drawHeight = videoHeightInDrawCoords;
    }
    // Convert a point in video coordinates to draw coordinates.
    function toDrawPoint(position) {
        return {
            x: xOffset + position.x * drawWidth / videoWidth,
            y: yOffset + position.y * drawHeight / videoHeight,
        };
    }
    // Convert a width in video coordinates to draw coordinates.
    function toDrawScale(width) {
        return width * drawWidth / videoWidth;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = `rgba(255,255,255,${backgroundOpacity})`;
    if (frame.dropped) {
        ctx.fillStyle = "gray";
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    frame.poses.forEach(pose => paintPose(ctx, pose, toDrawPoint, toDrawScale, debugView));
}