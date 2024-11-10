import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Focus from "../pages/Focus";
import Header from "../component/Header";
import Analysis from "../pages/Analysis";
import Setting from "../pages/Setting";
import TimerProvider from "./TimerProvider";
import browser from "webextension-polyfill";


const Popup = () => {

      const [selected, setSelected] = useState<number>(0)

      const RenderPage = () => {
            switch (selected) {
                  case 0: return <Focus />;
                  case 1: return <Analysis />;
                  case 2: return <Setting />
            }
      }

      return (
            <TimerProvider>
                  <div className="w-full h-full flex flex-col">
                        <Header setTab={setSelected} />
                        {RenderPage()}
                  </div>
            </TimerProvider>
      )
}

export default Popup
