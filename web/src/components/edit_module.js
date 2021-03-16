import {
    useEffect,
    useRef,
    useState,
    forwardRef,
} from "react";
import {
    Button, Paper, Typography, Slider
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import RecordingCanvas from "../detection/recording_canvas.js";
import RecordingsView from "./recordings_module.js";
import { setFrameStartEnd } from "../detection/recording_editor.js";

const useStyles = makeStyles((theme) => ({
    root: {
        // width: "100%",
        // height: "250px",
    },
    canvasParent: {
        position: "relative",
        // backgroundColor: "red",
    },
    poses: {

    },
    canvas: {
        // position: "absolute",
    }
}));

async function sleep(wait) {
    return new Promise(resolve => {
        setTimeout(() => resolve(0), wait);
    });
}

function PoseEditor({ pose, poseIndex, recording }) {
    function setFirstFrame() {
        recording.forEach((pose, idx) => {
            if (idx < poseIndex) {
                pose.dropped = true;
            } else {
                pose.dropped = false;
            }
        })
    }
    return <div>
        <Button onClick={setFirstFrame}>First frame</Button>
        <Button>Last frame</Button>
    </div>
    return "Edit!: " + pose?.t;
}

function EditModule({ recording, editCallback }) {
    const classes = useStyles();

    const canvasRef = useRef();
    const [showEveryFrame, setShowEveryFrame] = useState(4);

    // function doSave() {
    //     editCallback(recording);
    // }
    return <div>
        <Typography variant="body1">This is what your gif will look like:</Typography>
        <RecordingCanvas recording={recording} />

        Set the start and end range to export:
        <Slider
            value={[recording.firstFrame, recording.lastFrame]}
            onChange={(e, newRange) => {
                const newRecording = JSON.parse(JSON.stringify(recording));
                setFrameStartEnd(newRecording, newRange[0], newRange[1]);
                editCallback(newRecording);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={recording.poses.length - 1}
        />

        {/* <Typography id="frame-zoom-slider" gutterBottom>
            Frame zoom level
        </Typography>
        <Slider
            onChange={(e, newValue) => { setShowEveryFrame(newValue) }}
            value={showEveryFrame}
            getAriaValueText={v => v}
            aria-labelledby="frame-zoom-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={recording.poses.length}
        /> */}

        {/* Mini viewer */}
        {/* <div className={classes.poses}>
            Set the first and last frames to export (or leave as is, if you like).
            <RecordingsView
                recording={recording}
                outEvery={showEveryFrame}
                updateRecordingCallback={(newRecordings) => {
                    editCallback(newRecordings);
                }}
            >
            </RecordingsView>
        </div> */}

    </div >;
}
export default EditModule;
