import browser, { storage } from "webextension-polyfill";
import '../types/ApiType.d'
import * as service from './background.service'
import { listUrl } from "./background.service";
import emailjs from '@emailjs/browser';

export let GlobalPort: browser.Runtime.Port | undefined;

console.log("Hello from the background!");

/**
 * Event when extension is installed 
 */
browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);
});


/**
 * Update state of extension whenever browser is opened 
 */
(async () => {
    await service.GetCurrentStateOfExtension()
    await service.UpdateListURL()
    await service.LoadSettingValue()
    Mail()
})();


/**
 * End point handler
 * Navigave API from popup and content script to background 
 */
browser.runtime.onMessage.addListener((message: ApiType, sender: browser.Runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (!sender.tab) {
        switch (message.action) {
            case 'create-new-card':
                if (message.data) service.CreateNewCard(message.data)
                break;
            case 'fetch-data-cards':
                service.FetchDataCards(sendResponse)
                return true;  // keep connection open 
            case 'remove-card':
                service.RemoveCardById(message.data)
                break;
            case 'create-new-timer':
                service.CreateTimer(message.data)
                break;
            case 'delete-timer':
                service.DeleteTimer(message.data) // dont need data any more 
                break;
            case 'reset-timer':
                service.ResetTimer()
                break;
            case 'update-state':
                service.UpdateState(message.data)
                break;
            case 'get-state':
                service.GetCurrentState(sendResponse)
                return true;
            case 'fetch-tempolary-data':
                service.FetchTempolaryData(sendResponse)
                return true;
            case 'remove-tempolary-data':
                ClearTempolaryVar()
                break
            case 'fetch-chart-data':
                Mail()
                service.FetchHistoryWebsiteData(sendResponse)
                return true
            case 'update-setting':
                service.UpdateSettingData(message.data)
                break
            case 'get-setting-data':
                service.FetchSettingData(sendResponse)
                return true
        }
    }
    else {

    }
})


/**
 * Communication pipline (long-live connection)
 * Create a connection to background for data transfering 
 * @var port is a port connected from popup or content srcipt 
 * @var GlobalPort is a global variable reference to the port, so if the port change GlobalPort will change accordingly 
 * @notice if use go on-off, @var port will change 
 */

let target: string = ''
let redirect: string = ''
let index: number = -1;

export function ClearTempolaryVar() {
    redirect = ''
    target = ''
    index = -1
}

browser.runtime.onConnect.addListener((port: browser.Runtime.Port) => {
    GlobalPort = port
    console.log("connect from ", port);

    //load data for temporaly variable when popup open
    (async () => {
        const d = await browser.storage.local.get('temp')
        console.log("data stored: ", d)
        target = d.temp?.target
        redirect = d.temp?.redirect
        index = d.index
    })();

    // message from popup to background
    port.onMessage.addListener((api: ApiType) => {
        //listen to change of draft data in popup 
        if (api.action === 'change-target') {
            if (api.data.content) {
                target = api.data.content
                index = api.data.index
                console.log(target)
            }
        }
        else {
            if (api.data.content) {
                redirect = api.data.content
                index = api.data.index
                console.log(redirect)
            }
        }
    })

    // when disconnecting, it's mean popup is closed, store draft data to browser local storage 
    port.onDisconnect.addListener(async () => {
        GlobalPort = undefined
        console.log("value befored disconnect ", target, redirect)
        if (target?.length === 1) target = ''
        if (redirect?.length === 1) redirect = ''
        // in case, at least one draft data, it have to be stored 
        if (target || redirect) {
            const tempCard: CardType = {
                index, target, redirect, tempolary: true
            }
            await browser.storage.local.set({ temp: tempCard })
            console.log("save metadata successfully")
        }
        // in case, there are no draft data anymore, remove storage 
        else {
            await browser.storage.local.remove('temp')
            console.log("remove meta data")
        }
    })
})



// listen to event direct URL, if URL is in listURL -> perform prevention 
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
    // track and collect data of history of browsing website 
    if (service.TRACK_HISTORY_WEB) service.CollectHistoryData(tabInfo.url)

    if (!service.TimerRuning || !service.isBlockTime) return

    if (changeInfo.status !== 'complete' || !tabInfo.url) return

    //DEBUG
    const obj = service.GetNameWebSite(tabInfo.url)
    console.log(obj)

    // block website if it is in list records 
    const keyDict = Object.keys(listUrl).find(key => tabInfo.url?.includes(key))

    if (!keyDict) return

    if (listUrl[keyDict] === '') {
        const content = {
            active: service.USE_DELAY, delay: service.DEFAULT_DELAY
        }
        console.log("send data to content ", content)
        try {
            await browser.tabs.sendMessage(tabId, content);
        } catch (error) {
            console.error("Failed to send message to content script:", error);
        }
    }
    else browser.tabs.update({ "url": listUrl[keyDict] })
})


browser.tabs.onActivated.addListener(async (activeInfo) => {
    if (!service.TRACK_HISTORY_WEB) return;
    const focusTab = await browser.tabs.get(activeInfo.tabId)
    if (focusTab && focusTab.url) {
        console.log("Active another tabs")
        service.CollectHistoryData(focusTab.url)
    }
})


// init EmailJS
function initMail() {
    emailjs.init({
        publicKey: "XToU1KzFwnW9N24iU",
    });
    console.log("init emailjs")
};


// send email via EmailJS
async function sendEmail(params: { [key: string]: any }) {
    try {
        const response = await emailjs.send('digital-diet', 'template_u1axfy2', params);
        console.log('Email sent successfully!', response.status, response.text);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

// check for valid email 
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// create email template 
async function CreateEmail(): Promise<object | undefined> {
    try {
        const data = await service.FetchDataDaily()
        console.log(data)
        if (!data) return undefined
        console.log(service.EMAIL)
        if (!isValidEmail(service.EMAIL)) {
            console.log("invalid email")
            return undefined
        }
        const emailParams = {
            to_name: service.EMAIL,
            productive: data.productiveTime,
            distractive: data.distractiveTime,
            website: data.dailywebsite,
            concetrate: (data.productiveTime / (data.productiveTime + data.distractiveTime) * 100).toFixed(2)
        };
        return emailParams
    }
    catch (error) {
        console.log(error)
        return undefined
    }
}

async function Mail() {
    try {
        // get the previous online time 
        const { recentOnline: previous } = await browser.storage.local.get('recentOnline')
        console.log("previous online", previous)

        if (previous) {
            const quatumTime = new Date().getTime() - new Date(previous).getTime()
            const daysDifference = Math.floor(quatumTime / (1000 * 60 * 60 * 24));
            console.log("diffirent days:", daysDifference)
            const lastOnline: number = new Date(previous).getDay()
            const today: number = new Date().getDay()
            console.log("today ", today, "yesterday ", lastOnline)
            // if that online is a new day 
            if (lastOnline === today) {
                if (service.USE_EMAIL) {
                    initMail()
                    const emailParams = await CreateEmail()
                    if (emailParams) await sendEmail(emailParams);
                    else console.log("undefine or invalid mail")
                }
                // clear data after send email 
                await browser.storage.local.remove('dailyData')
            }

            // clear last week data if this is the first time online in this week 
            if ((today !== lastOnline && lastOnline === 0) || (today < lastOnline && today !== 0) || (daysDifference >= 7)) {
                await browser.storage.local.remove('distractive')
                await browser.storage.local.remove('productive')
                await browser.storage.local.remove('weekData')
            }
        }
        // update date for this online
        const now: Date = new Date()
        browser.storage.local.set({ recentOnline: now.toString() })
    }
    catch (error) {
        console.log(error)
    }
}