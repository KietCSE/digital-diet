import React, { useEffect, useRef, useState } from 'react'
import Toggle from '../component/Toggle'
import Notification from '../component/Notification'
import browser from "webextension-polyfill";


const Setting = () => {

    const [trackHistory, setTrackHistory] = useState<boolean>(true)
    const [useEmail, setUseEmail] = useState<boolean>(false)
    const [useDelay, setUseDelay] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [delay, setDelay] = useState<string>('0')
    const isMounted = useRef<boolean>(false)

    useEffect(() => {
        // update data for setting 
        const getSettingData = async () => {
            const api: ApiType = { action: 'get-setting-data' }
            const response: SettingType = await browser.runtime.sendMessage(api)
            console.log("setting from background", response)
            setTrackHistory(response.trackHistory)
            setUseDelay(response.useDelay)
            setUseEmail(response.useEmail)
            setDelay(response.delay.toString())
            setEmail(response.email)
        }

        getSettingData()

    }, [])

    useEffect(() => {
        if (isMounted.current) updateSetting();
        else isMounted.current = true
    }, [useDelay, useEmail, trackHistory, email, delay]);

    const updateSetting = () => {
        const data: SettingType = { trackHistory, useEmail, useDelay, email, delay: parseInt(delay, 10) }
        const api: ApiType = { action: 'update-setting', data }
        console.log("send mess to update setting")
        browser.runtime.sendMessage(api)
    }

    const updateEmail = async () => {
        setUseEmail(prev => !prev)
    }

    const updateDelay = () => {
        setUseDelay(prev => !prev)
    }

    const updateTrackHistory = () => {
        setTrackHistory(prev => !prev)
    }

    return (
        <>
            <Toggle name="Track history web"
                desc="Enable this feature to allow the extension to track your browsing history. We'll save data and analyze them to provide insights charts"
                setValue={updateTrackHistory}
                value={trackHistory}
            />

            <Notification name="Notification"
                desc='We will email to you a perfomance report for each week'
                field='Email'
                setValue={updateEmail}
                setBlur={setEmail}
                value={email}
                isUse={useEmail}
            />

            <Notification name="Minimum default delay"
                desc='If you do not set a redirect link, we will delay number second whenever you access this link, every your activity in this URL is also delayed'
                field='Seconds'
                setValue={updateDelay}
                setBlur={setDelay}
                value={delay}
                isUse={useDelay}
            />
        </>
    )
}

export default Setting
