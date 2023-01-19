import React from 'react'
import './TestPage.css'

import intl from 'react-intl-universal'


export default function TestPage() {


  return (
    <div id="testbox">TestPagea:{intl.get('key1')}</div>
  )
}

