import React from 'react'
import './TestPage.css'

import intl from 'react-intl-universal'


export default function TestPage() {
  let charsp = intl.get('key1')


  return (
    <div id="testbox">TestPagea:{charsp}</div>
  )
}

