/***
 *  @description 根组件
 */
import React from "react";
import {Provider} from "react-redux";
import {GlobalStyle} from "./style";
import {IconStyle} from "./assets/iconfont/iconfont";
import {renderRoutes} from "react-router-config";
import routes from "./routes/index.js";
import {HashRouter} from "react-router-dom";
import store from "./store/index";


function App() {
  return (
    <Provider store={store}>
        <HashRouter>
            <GlobalStyle></GlobalStyle>
            <IconStyle></IconStyle>
            {
                renderRoutes(routes)
            }
         </HashRouter>
    </Provider>
  );
}

export default App;
