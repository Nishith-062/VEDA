import { Wifi, WifiOff } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const Online = () => {

  const [online,setIsOnline]=useState(navigator.onLine)

  useEffect(()=>{
    setIsOnline(navigator.onLine)
  },[navigator.onLine])

  return (
    <div>
    {navigator.onLine ? <Wifi className='text-green-800' /> : <WifiOff className='text-red-800' />}
    </div>
  )
}

export default Online