import { Wifi, WifiOff } from 'lucide-react'
import React from 'react'

const Online = () => {

  return (
    <div>
    {navigator.onLine ? <Wifi className='text-green-800' /> : <WifiOff className='text-red-800' />}
    </div>
  )
}

export default Online