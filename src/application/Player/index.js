import React, {useRef, useState, useEffect} from "react";
import {connect} from "react-redux";
import {changePlayingState, changeShowPlayList, changeCurrentIndex, changeCurrentSong, changePlayList, changePlayMode, changeFullScreen} from "./store/actionCreators";
import MiniPlayer from "./miniPlayer";
import NormalPlayer from "./normalPlayer";
import {getSongUrl, isEmptyObject, shuffle, findIndex} from "../../api/utils";
import {playMode} from "../../api/config";
import Toast from "./../../baseUR/toast/index";

function Player(props) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;
    const [preSong, setPreSong] = useState({});
    const [modeText, setModeText] = useState("");
    const [songReady, setSongReady] = useState(true);
    const audioRef = useRef();
    const toastRef = useRef();
    const {playing, currentSong: immutableCurrentSong, currentIndex, playList: immutablePlayList, mode, sequencePlayList: immutableSequencePlayList, fullScreen} = props;
    const {togglePlayingDispatch, changeCurrentIndexDispatch, changeCurrentDispatch, changePlayListDispatch, changeModeDispatch, toggleFullScreenDispatch} = props;
    const playList = immutablePlayList.toJS();
    const sequencePlayList = immutableSequencePlayList.toJS();
    const currentSong = immutableCurrentSong.toJS();

    useEffect(() => {
        if(!playList.length || currentIndex === -1 || !playList[currentIndex] || playList[currentIndex].id === preSong.id || !songReady) return
        let current = playList[currentIndex];
        setPreSong(current);
        setSongReady(false);
        changeCurrentDispatch(current);
        audioRef.current.src = getSongUrl(current.id);
        setTimeout(() => {
            audioRef.current.play().then(() => {
                setSongReady(true);
            })
        });
        togglePlayingDispatch(true);
        setCurrentTime(0);
        setDuration((current.dt / 1000) | 0)
    }, [playList, currentIndex]);

    useEffect(() => {
        playing ? audioRef.current.play() : audioRef.current.pause();
    }, [playing]);

    const clickPlaying = (e, state) => {
        e.stopPropagation();
        togglePlayingDispatch(state);
    }

    const updateTime = e => {
        setCurrentTime(e.target.currentTime);
    }

    const onProgressChange = curPercent => {
        const newTime = curPercent * duration;
        setCurrentTime(newTime);
        audioRef.current.currentTime = newTime;
        if(!playing) {
            togglePlayingDispatch(true);
        }
    }

    const handleLoop = () => {
        audioRef.current.currentTime = 0;
        changePlayingState(true);
        audioRef.current.play();
    }

    const handlePrev = () => {
        if(playList.length === 1){
            handleLoop();
            return;
        }
        let index = currentIndex - 1;
        if(index < 0) index = playList.length - 1;
        if(!playing) togglePlayingDispatch(true);
        changeCurrentIndexDispatch(index);
    }

    const changeMode = () => {
        let newMode = (mode + 1) % 3;
        if(newMode === 0) {
            changePlayListDispatch(sequencePlayList);
            let index = findIndex(currentSong, sequencePlayList);
            changeCurrentIndexDispatch(index);
            setModeText('顺序循环');
        } else if(newMode === 1) {
            changePlayListDispatch(sequencePlayList);
            setModeText("单曲循环");
        } else if(newMode === 2) {
            let newList = shuffle(sequencePlayList);
            let index = findIndex(currentSong, newList);
            changePlayListDispatch(newList);
            changeCurrentIndexDispatch(index);
            setModeText("随机播放");
        }
        changeModeDispatch(newMode);
        toastRef.current.show();
    }

    const handleNext = () => {
        if(playList.length === 1) {
            handleLoop();
            return;
        }
        let index = currentIndex + 1;
        if(index === playList.length) index = 0;
        if(!playing) togglePlayingDispatch(true);
        changeCurrentIndexDispatch(index);
    }

    const handleEnd = () => {
        if(mode === playMode.loop){
            handleLoop();
        } else {
            handleEnd();
        }
    }

    return (
        <div>
            {
                isEmptyObject(currentSong) ? null : (
                    <MiniPlayer song={currentSong}
                        fullScreen={fullScreen}
                        playing={playing}
                        toggleFullScreen={toggleFullScreenDispatch}
                        clickPlaying={clickPlaying}
                        percent={percent}/>
                )
            }
            {
                isEmptyObject(currentSong) ? null : (
                    <NormalPlayer song={currentSong}
                        fullScreen={fullScreen}
                        playing={playing}
                        mode={mode}
                        changeMode={changeMode}
                        duration={duration}
                        currentTime={currentTime}
                        percent={percent}
                        toggleFullScreen={toggleFullScreenDispatch}
                        clickPlaying={clickPlaying}
                        onProgressChange={onProgressChange}
                        handlePrev={handlePrev}
                        handleNext={handleNext}/>
                )
            }
            <audio ref={audioRef}
                onTimeUpdate={updateTime}
                onEnded={handleEnd}/>
            <Toast text={modeText} ref={toastRef}/>
        </div>
    )
};

const mapStateToProps = state => ({
    fullScreen: state.getIn(["player", "fullScreen"]),
    playing: state.getIn(["player", "playing"]),
    currentSong: state.getIn(["player", "currentSong"]),
    showPlayList: state.getIn(["player", "showPlayList"]),
    mode: state.getIn(["player", "mode"]),
    currentIndex: state.getIn(["player", "currentIndex"]),
    playList: state.getIn(["player", "playList"]),
    sequencePlayList: state.getIn(["player", "sequencePlayList"])
});

const mapDispatchToProps = dispatch => {
    return {
        togglePlayingDispatch(data) {
            dispatch(changePlayingState(data));
        },
        toggleFullScreenDispatch(data){
            dispatch(changeFullScreen(data));
        },
        togglePlayListDispatch(data) {
            dispatch(changeShowPlayList(data));
        },
        changeCurrentIndexDispatch(index){
            dispatch(changeCurrentIndex(index));
        },
        changeCurrentDispatch(data){
            dispatch(changeCurrentSong(data));
        },
        changeModeDispatch(data) {
            dispatch(changePlayMode(data));
        },
        changePlayListDispatch(data) {
            dispatch(changePlayList(data));
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player));
