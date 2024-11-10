import React, { useState, createContext, useRef, useContext, useEffect, useLayoutEffect } from 'react'
import browser from "webextension-polyfill";

const TimerContext = createContext<TimerContextType | null>(null)

interface TimerContextType {
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    isRunning: boolean;
    breaktime: number;
    blocktime: number;
    start_stop: () => void;
    reset: () => void;
    formatTime: () => string;
    sendData: (action: string, data: string, index: number) => void;
    isBlock: boolean,
    setBreakTime: React.Dispatch<React.SetStateAction<number>>;
    setBlockTime: React.Dispatch<React.SetStateAction<number>>;
}

const TimerProvider = ({ children }: { children: React.ReactNode }) => {

    const [isRunning, setRunning] = useState<boolean>(false)
    const [isBlock, setBlock] = useState<boolean>(true)
    const [timer, setTimer] = useState<number>(0)
    const [breaktime, setBreakTime] = useState<number>(0)
    const [blocktime, setBlockTime] = useState<number>(0)
    const portId = useRef<browser.Runtime.Port>()

    useEffect(() => {
        portId.current = browser.runtime.connect({ name: 'popup' })

        portId.current.onMessage.addListener((mess) => {
            // console.log("Mess from background ", mess)
            if (typeof mess === 'number') setTimer(mess)
            else {
                if (mess === 'blocktime') {
                    console.log('set running true')
                    setBlock(true)
                }
                if (mess === 'breaktime') {
                    console.log('set running false')
                    setBlock(false)
                }
            }
        })

        portId.current.onDisconnect.addListener(() => {
            console.log("disconnect with backgournd ")
        })

        // set current state when popup is opened 
        const api: ApiType = { action: 'get-state' }
        const getState = async () => {
            const response = await browser.runtime.sendMessage(api)
            console.log("current state: ", response)
            // if states have already saved in browser 
            setRunning(response.state)
            setBlock(response.block)
            if (!response.state) setTimer(response.time)
            else setTimer(-1)
            setBlockTime(response.blocktime)
            setBreakTime(response.breaktime)
        }
        getState()
    }, [])

    // send draft data to background through pipline 
    function sendData(action: string, data: string, index: number): void {
        if (portId.current) {
            const payload: object = {
                content: data,
                index: index,
            }
            const api: ApiType = { action, data: payload }
            portId.current.postMessage(api)
        }
        else console.log("There is no pipline anymore")
    }

    // store current state to background 
    function changeState(value: boolean) {
        const api: ApiType = { action: 'update-state', data: value }
        browser.runtime.sendMessage(api)
    }

    //start counting down or stop counting down 
    function start_stop(): void {
        if (timer === 0) return
        if (isRunning) {
            setRunning(false)
            const api: ApiType = { action: 'delete-timer', data: timer }
            console.log("send data stop ", api)
            browser.runtime.sendMessage(api)
        }
        else {
            setBlock(true)
            setRunning(true)
            const data = { timer, blocktime, breaktime, isBlock }
            const api: ApiType = { action: 'create-new-timer', data }
            console.log("send data ", api)
            browser.runtime.sendMessage(api)
        }
    }

    function reset(): void {
        const api: ApiType = { action: 'reset-timer' }
        browser.runtime.sendMessage(api)
        setTimer(0)
        setRunning(false)
        setBlock(true)
        setBlockTime(0)
        setBreakTime(0)
    }

    function formatTime(): string {
        if (timer === -1) return "..."
        const se: number = timer % 60;
        const min: number = Math.floor(timer / 60);
        const se_str: string = se < 10 ? `0${se}` : se.toString();
        const min_str: string = min < 10 ? `0${min}` : min.toString();
        return min_str + ":" + se_str;
    }

    return (
        <TimerContext.Provider value={{
            setTimer, isRunning, breaktime, blocktime, start_stop, reset,
            formatTime, sendData, isBlock, setBreakTime, setBlockTime
        }}>
            {children}
        </TimerContext.Provider>
    )
}

export default TimerProvider

export const useTimer = () => {
    const context = useContext(TimerContext)
    if (context === null) {
        throw new Error("useTimer error")
    }
    return context;
}
