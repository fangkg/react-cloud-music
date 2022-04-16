import React, {useState, useEffect, useRef, useCallback} from "react";
import {CSSTransition} from "react-transition-group";
import {Container} from "./style";
import {HEADER_HEIGHT} from "./../../api/config";
import {ImgWrapper, CollectButton, SongListWrapper, BgLayer} from "./style";
import Header from "../../baseUI/header/index";
import Scroll from "../../baseUI/scroll/index";
import SongsList from "../SongsList";
import {connect} from "react-redux";
import Loading from "./../../baseUI/loading/index";
import {getSingerInfo, changeEnterLoading} from "./store/actionCreators";

function Singer(props) {
    const initialHeight = useRef(0);
    const [showStatus, setShowStatus] = useState(true);
    const {
        artist: immutableArtist,
        songs: immutableSongs,
        loading
    } = props;
    const {getSingerDataDispatch} = props;
    const artist = immutableArtist.toJS();
    const songs = immutableSongs.toJS();
    const collectButton = useRef();
    const imageWrapper = useRef();
    const songScrollWrapper = useRef();
    const songScroll = useRef();
    const header = useRef();
    const layer = useRef();
    const OFFSET = 5;

    useEffect(() => {
        const id = props.match.params.id;
        getSingerDataDispatch(id);
        let h = imageWrapper.current.offsetHeight;
        initialHeight.current = h;
        songScrollWrapper.current.style.top = `${h - OFFSET}px`;
        layer.current.style.top = `${h - OFFSET}px`;
        songScroll.current.refresh();
    }, []);

    const handleScroll = useCallback(pos => {
        let height = initialHeight.current;
        const newY = pos.y;
        const imageDOM = imageWrapper.current;
        const buttonDOM = collectButton.current;
        const headerDOM = header.current;
        const layerODM = layer.current;
        const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;
        const percent = Math.abs(newY / height);

        if(newY > 0){
            imageDOM.style["transform"] = `scale(${1 + percent})`;
            buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
            layerODM.style.top = `${height - OFFSET + newY}px`;
        } else if(newY >= minScrollY) {
            layerODM.style.top = `${height - OFFSET - Math.abs(newY)}px`;
            layerODM.style.zIndex = 1;
            imageDOM.style.paddingTop = "75%";
            imageDOM.style.height = 0;
            imageDOM.style.zIndex = -1;
            buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
            buttonDOM.style["opacity"] = `${1 - percent * 2}`;
        } else if(newY < minScrollY) {
            layerODM.style.top = `${HEADER_HEIGHT - OFFSET}px`;
            layerODM.style.zIndex = 1;
            headerDOM.style.zIndex = 100;
            imageDOM.style.height = `${HEADER_HEIGHT}px`;
            imageDOM.style.paddingTop = 0;
            imageDOM.style.zIndex =99;
        }
    }, []);

    const setShowStatusFalse = useCallback(() => {
        setShowStatus(false);
    }, []);

    return (
        <CSSTransition
            in={showStatus}
            timeout={300}
            className="fly"
            appear={true}
            unmountOnExit
            onExited={() => props.history.goBack()}
        >
            <Container>
               <Header handleClick={setShowStatusFalse} title={artist.name} ref={header}></Header>
                <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
                    <div className="filter"></div>
                </ImgWrapper>
                <CollectButton ref={collectButton}>
                    <i className="iconfont">&#xe62d;</i>
                    <span className="text">收藏</span>
                </CollectButton>
                <BgLayer ref={layer}></BgLayer>
                <SongListWrapper ref={songScrollWrapper}>
                    <Scroll ref={songScroll} onScroll={handleScroll}>
                        <SongsList songs={songs} showCollect={false}></SongsList>
                    </Scroll>
                </SongListWrapper>
                {
                    loading ? <Loading/> : null
                }
            </Container>
        </CSSTransition>
    )
}

const mapStateToProps = state => ({
    artist: state.getIn(["singerInfo", "artist"]),
    songs: state.getIn(["singerInfo", "songsOfArtist"]),
    loading: state.getIn(["singerInfo", "loading"])
});

const mapDispatchToProps = dispatch => {
    return {
        getSingerDataDispatch(id) {
            dispatch(changeEnterLoading(true));
            dispatch(getSingerInfo(id));
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singer));
