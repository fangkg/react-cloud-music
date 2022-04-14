import React, {useEffect} from "react";
import Slider from "../../components/slider/";
import {connect} from "react-redux";
import {forceCheck} from "react-lazyload";
import * as actionTypes from "./store/actionCreator";
import RecommendList from "../../components/list/index";
import Scroll from "../../baseUI/scroll/index";
import {Content} from "./style";
import Loading from "../../baseUI/loading/index";


function Recommend(props){
    const {bannerList, recommendList, enterLoading} = props;
    const {getBannerDataDispatch, getRecommendListDataDispatch} = props;

    useEffect(() => {
        if(bannerList && !bannerList.size) {
            getBannerDataDispatch();
        }
        if(recommendList && !recommendList.size){
            getRecommendListDataDispatch();
        }
    }, []);

    const bannerListJS = bannerList ? bannerList.toJS() : [];
    const recommendListJS = recommendList ? recommendList.toJS() : [];


    return (
        <Content>
            <Scroll onScroll={forceCheck}>
                <div>
                    <Slider bannerList={bannerListJS}></Slider>
                    <RecommendList recommendList={recommendListJS}></RecommendList>
                </div>
            </Scroll>
            {
                enterLoading ? <Loading></Loading> : null
            }
        </Content>
    )
}

// 映射Redux全局的state到组件的props上
const mapStateToProps = (state) => ({
    bannerList: state.getIn(['recommend', 'bannerList']),
    recommendList: state.getIn(['recommend', 'recommendList']),
    enterLoading: state.getIn(['recommend', 'enterLoading'])
});

// 映射dispatch到props上
const mapDispatchToProps = (dispatch) => {
    return {
        getBannerDataDispatch(){
            dispatch(actionTypes.getBannerList());
        },
        getRecommendListDataDispatch() {
            dispatch(actionTypes.getRecommendList());
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Recommend));

