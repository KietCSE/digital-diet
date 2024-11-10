import React, { useState, useEffect, useRef } from 'react'
import NumberButton from './NumberButton'
import { useTimer } from '../pages/TimerProvider'

const Timer = () => {

    const { setTimer, isRunning, start_stop, reset, formatTime, isBlock, setBreakTime, setBlockTime, breaktime, blocktime } = useTimer();

    function SetBlockTimeAndTimer(time: number) {
        setTimer(prev => prev + time * 60)
        setBlockTime(prev => prev + time * 60)
    }

    function SetBreakTime(time: number) {
        setBreakTime(prev => prev + time * 60)
    }

    return (
        <div className='h-2/5 text-lg flex flex-col items-center justify-center'>
            <p className={`text-xl mb-2 px-2 rounded-md ${isBlock ? 'bg-red-500' : 'bg-green-500'}`}>{isBlock ? 'Block Session' : 'Break Session'}</p>
            <h1 className='text-6xl'>{formatTime()}</h1>
            <div className="mt-2 flex gap-x-16">
                <button
                    onClick={start_stop}
                    className={`mt-2 h-9 w-[80px] rounded ${!isRunning ? 'bg-press-color hover:bg-blue-500' : 'bg-red-500 hover:bg-red-700'}`}>
                    {!isRunning ? 'Start' : 'End'}
                </button>
                <button
                    onClick={reset}
                    className='mt-2 h-9 w-[80px] bg-press-color rounded hover:bg-blue-500'>
                    Reset
                </button>
            </div>
            <div className='pt-2 flex gap-x-16'>
                <p className='text-sm'>Session length</p>
                <p className='text-sm'>Break length</p>
            </div>
            <div className='pt-2 flex gap-x-12'>
                <NumberButton setTimer={SetBlockTimeAndTimer} time={blocktime} />
                <NumberButton setTimer={SetBreakTime} time={breaktime} />
            </div>
        </div>
    )
}

export default Timer
