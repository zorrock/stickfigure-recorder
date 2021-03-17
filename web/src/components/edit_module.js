import { useState } from "react";
import {
    Typography, Slider
} from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import RecordingCanvas from "../detection/recording_canvas.js";
import { setFrameStartEnd } from "../detection/recording_editor.js";
import { useTranslation } from 'react-i18next';

const RangeSlider = withStyles({
    root: {
        color: '#220000',
        height: 3,
        padding: '13px 0',
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: '#fdfdfd',
        marginTop: -12,
        marginLeft: -13,
        boxShadow: '#ccc 0 2px 3px 1px',
        '&:focus, &:hover, &$active': {
            boxShadow: '#999 0 2px 3px 1px',
        },
        '& .arrowRight': {
            width: "0",
            height: "0",
            marginLeft: "2px",
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: "10px solid #4350AF",
        },
        '& .arrowLeft': {
            width: "0",
            height: "0",
            marginRight: "2px",
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: "10px solid #4350AF",
        }
    },
})(Slider);
function RangeSliderThumbComponent(props) {
    const isOpeningRange = props["data-index"] === 0;
    if (isOpeningRange) {
        return (
            <span {...props}>
                <span className="arrowRight" />
            </span>
        );
    }
    return (
        <span {...props}>
            <span className="arrowLeft" />
        </span>
    );
}

function EditModule({ recording, editCallback }) {
    const { t } = useTranslation();

    // If true, forces the RecordingCanvas to show either the first or last frame.
    // This is useful because it lets the user preview the frame as they update the
    // start/end frames. 
    const [fixFrameToStart, setFixFrameToStart] = useState(false);
    const [fixFrameToEnd, setFixFrameToEnd] = useState(false);
    return <div>
        <RecordingCanvas
            recording={recording}
            fixFrameToStart={fixFrameToStart}
            fixFrameToEnd={fixFrameToEnd}
        />

        <Typography variant="body1">{t("Set the start and end range to export")}</Typography>
        <RangeSlider
            value={[recording.firstFrame, recording.lastFrame]}
            onChange={(e, newRange) => {
                // User is moused-down on either the start or end thumbs.
                const isStart = e.target.dataset["index"] === "0";
                if (isStart) {
                    setFixFrameToStart(true);
                } else {
                    setFixFrameToEnd(true);
                }
                const newRecording = JSON.parse(JSON.stringify(recording));
                setFrameStartEnd(newRecording, newRange[0], newRange[1]);
                editCallback(newRecording);
            }}
            onChangeCommitted={(e, newRange) => {
                // The user has moused-up.
                setFixFrameToStart(false);
                setFixFrameToEnd(false);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={recording.frames.length - 1}
            ThumbComponent={RangeSliderThumbComponent}
        />
    </div >;
}
export default EditModule;
