import React, { useEffect, useState } from 'react';
import './App.css';
import intl from 'react-intl-universal';//国际化
import zhCN from './locales/zh-CN.json'//中文包
import enUS from './locales/en-US.json'//英文包

import Mainpage from './pages/mainpage/Mainpage';
import TestPage from './pages/mainpage/TestPage';


// locale data
const locales = {
  "en": enUS,
  "cn": zhCN,
};

function App() {

  // 根据浏览器url参数设置语言
  useEffect(() => {
    let langtype = intl.determineLocale({
      urlLocaleKey: "lang"
    });
    if (!Object.keys(locales).includes(langtype)) {
      langtype = "cn";
    }
    intl.init({
      currentLocale: langtype,
      locales,
    });
  }, []);

  return (
    <div className="App">
        <Mainpage />
    </div>
  );
}

export default App;
