import * as storage from './background.storage'
import browser, { bookmarks } from "webextension-polyfill";
import { GlobalPort } from './background';
import { ClearTempolaryVar } from './background';
import { send } from 'emailjs-com';

/**
 * List of value - key to persit data in browser local storage 
 * @key list-card       @val url card for block or redirect website  
 * @key state           @val current state of timer, true = is runing, false = stoped 
 * @key clock           @val current value of timer, unit is second: 1s,2s,3s,... 
 * @key breaktime       @val breaktime is set for timer 
 * @ket blocktime       @val blocktime is set for timer 
 * @key block           @val current blockstate of timer, true = is blocking, false = is breaking 
 * @key temp            @val tempolary data when user input 
 * @key distractive     @val object to store time for distractive url {monday: 100, tuesday: 50,...}
 * @key productive      @val object to store time for productive url {monday: 100, tuesday: 50,...}
 * @key weekData        @val object to store time for each website this week {facebook: 100, game: 50, ...}
 * @key dailyData       @val object to store time for each website in day 
 * @key track_history   @val Is tracking website feature set ? true or false 
 * @key useEmail        @val is Email feature set ? true or false 
 * @key useDelay        @val is Delay feature set ? true or false 
 * @key email           @val string email of user 
 * @key default_delay   @val number of delay time for each request 
 * @key recentOnline    @val string contain date time for the last online 
 */


let IntervalId: NodeJS.Timeout
let TrackTimeInterval: NodeJS.Timeout                       // Timer variable 
let TIME: number                                            // global variable to store time of timer
export let TimerRuning: boolean = false                     // check for timer is running 
export let isBlockTime: boolean = false                     // Check for state of timer: block or break 
export let listUrl: { [key: string]: string } = {}          // list of URL to detox 
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', "Wednesday", 'Thursday', 'Friday', 'Saturday']

export let TRACK_HISTORY_WEB: boolean = true  // is tracking feature set ? 
export let USE_EMAIL: boolean = false          // is sending email feature set ?  
export let USE_DELAY: boolean = false         // is delay feature set ?
export let DEFAULT_DELAY: number = 0          // number of delay time 
export let EMAIL: string = ''                 // string email 

/**
 * Update URL when opening browser or create new card 
 * This function is call every new cards are created 
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function UpdateListURL(): Promise<boolean> {
    try {
        const data: CardType[] = await GetDataCard()
        listUrl = {}
        if (Array.isArray(data)) {
            data.forEach((e: CardType) => {
                if (e.target !== '') {
                    const target = GetDomainURL(e.target)
                    if (target) listUrl[target] = e.redirect
                }
            })
        }
        console.log("list url updated: ", listUrl)
        return true
    }
    catch (error) {
        console.log(error)
        return false
    }
}


/**
 * Get current state of extension, check old states of timer to update current state  
 * This function is called whenever browser is opened, make sure timer will keep its preivous states 
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function GetCurrentStateOfExtension(): Promise<void> {
    try {
        const isRunning = await browser.storage.local.get('state')
        console.log("state when start", isRunning['state'])
        if (isRunning['state']) {
            const time = await browser.storage.local.get('clock')
            TIME = time['clock']
            TimerRuning = true
            const block = await browser.storage.local.get('block')
            const blocktime = await browser.storage.local.get('blocktime')
            const breaktime = await browser.storage.local.get('breaktime')

            console.log("clock ", time['clock'])
            console.log("blocktime ", blocktime['blocktime'])
            console.log("breaktime ", breaktime['breaktime'])

            if (block['block']) {
                StartBlockTime(blocktime['blocktime'], breaktime['breaktime'])
            }
            else StartBreakTime(blocktime['blocktime'], breaktime['breaktime'])
        }
    }
    catch (error) {
        console.log("error when get current state of extension")
    }
}


/**
 * Save data to storage of browser (save on disk), remove tempolary data 
 * @param {string} card - new card to insert
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function CreateNewCard(card: object): Promise<boolean> {
    try {
        const data = await storage.GetDataFromBrowserStorage('list-card')
        const currentList = Array.isArray(data) ? data : []
        const newlist: object[] = [card, ...currentList]
        const isSave = await storage.SaveToBrowserStorage('list-card', newlist)
        const update = await UpdateListURL()
        await browser.storage.local.remove('temp')   // remove tempolary data in storage
        console.log("remove successfully")
        const d = await browser.storage.local.get('temp')
        console.log("d ", d)
        ClearTempolaryVar()   // clear value of variavle which store tempolary data
        return isSave && update
    }
    catch (error) {
        console.log(error)
        return false
    }
}

/**
 * Fetch data of cards from browser storage
 * @param {string} sendResponse - function to send response 
 * @returns {Promise<void>} - send data through method sendResponse 
 */
export async function FetchDataCards(sendResponse: (response?: any) => void): Promise<void> {
    try {
        const data = await storage.GetDataFromBrowserStorage('list-card') as object[]
        console.log("list", data)
        Array.isArray(data) ? sendResponse(data) : sendResponse([])
    }
    catch (error) {
        console.log(error)
    }
}


/**
 * Fetch data of cards from browser storage
 * @returns {Promise<CardType[]>} - return a list of card URL
 */
export async function GetDataCard(): Promise<CardType[]> {
    try {
        const data = await storage.GetDataFromBrowserStorage('list-card') as CardType[]
        return data ? data : []
    }
    catch (error) {
        console.log(error)
        return []
    }
}

/**
 * Remove card with id 
 * @param {string} id - id of card need to be removed 
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function RemoveCardById(id: number): Promise<boolean> {
    try {
        const data = await storage.GetDataFromBrowserStorage('list-card') as CardType[]
        const newdata = data.filter(element => element.index !== id)
        const isSave = await storage.SaveToBrowserStorage('list-card', newdata)
        console.log("new card ", newdata)
        const update = await UpdateListURL();
        return isSave && update
    }
    catch (error) {
        console.log(error)
        return false
    }
}


/**
 * Update new state: isRunning = true | false
 * @param {boolean} state - value need to be update
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function UpdateState(state: boolean): Promise<boolean> {
    try {
        const isSave = await storage.SaveToBrowserStorage('state', state)
        console.log("state update ", state)
        return isSave
    }
    catch (error) {
        console.log(error)
        return false
    }
}


export async function UpdateBlock(block: boolean): Promise<boolean> {
    try {
        const isSave = await storage.SaveToBrowserStorage('block', block)
        console.log("block update ", block)
        return isSave
    }
    catch (error) {
        console.log(error)
        return false
    }
}

/**
 * Get current states of timer to send to popup
 * This function is called whenever popup is opened 
 * @param {function} sendResponse - send response function 
 * @returns {Promise<void>} 
 */
export async function GetCurrentState(sendResponse: (response?: any) => void): Promise<void> {
    try {
        const state = await browser.storage.local.get('state')
        const block = await browser.storage.local.get('block')
        const breaktime = await browser.storage.local.get('breaktime')
        const blocktime = await browser.storage.local.get('blocktime')
        const time = await browser.storage.local.get('clock')  //time when stop timer 
        const stateResponse: boolean = state && state['state'] !== undefined ? state['state'] : false
        const blockResponse: boolean = block && block['block'] !== undefined ? block['block'] : true
        const breaktimeResponse: number = breaktime && breaktime['breaktime'] !== undefined ? breaktime['breaktime'] : 0
        const blocktimeResponse: number = blocktime && blocktime['blocktime'] !== undefined ? blocktime['blocktime'] : 0
        const timeResponse: number = time && time['clock'] !== undefined ? time['clock'] : 0
        const response = {
            state: stateResponse,
            block: blockResponse,
            time: timeResponse,
            blocktime: blocktimeResponse,
            breaktime: breaktimeResponse
        }
        sendResponse(response)
    }
    catch (error) {
        console.log(error)
    }
}


/**
 * Create timer with specific infor: breaktime, blocktime, first state, ... 
 * This function is called when user click on start button 
 * @param {any} data - object include many fields 
 * @returns {Promise<void>} 
 */
export function CreateTimer(data: any) {
    try {
        TIME = data.timer - 1
        const Blocktime: number = data.blocktime
        const Breaktime: number = data.breaktime
        const isBlock: boolean = data.isBlock
        browser.storage.local.set({ blocktime: Blocktime })
        browser.storage.local.set({ breaktime: Breaktime })
        TimerRuning = true
        UpdateState(true)
        if (isBlock) {
            StartBlockTime(Blocktime, Breaktime)
        }
        else StartBreakTime(Blocktime, Breaktime)
    }
    catch (error) {
        console.log(error)
    }

}

/**
 * Create timer with the first state is block time 
 * This function is one of two function to create infinity running timer 
 * @param {number} blocktime - time of block 
 * @param {number} breaktime - time of break
 * @returns {Promise<void>} 
 */
function StartBlockTime(blocktime: number, breaktime: number) {
    if (TIME === 0) {
        TIME = breaktime
        StartBreakTime(blocktime, breaktime)
    }
    else {
        isBlockTime = true
        UpdateBlock(true)
        if (GlobalPort) GlobalPort.postMessage("blocktime")

        IntervalId = setInterval(() => {
            if (GlobalPort) GlobalPort.postMessage(TIME)
            browser.storage.local.set({ clock: TIME })
            TIME -= 1
            if (TIME === -1) {
                TIME = breaktime
                clearInterval(IntervalId as NodeJS.Timeout)
                StartBreakTime(blocktime, breaktime)
            }
        }, 1000)
    }
}

/**
 * Create timer with the first state is break time 
 * This function is one of two function to create infinity running timer 
 * @param {number} blocktime - time of block 
 * @param {number} breaktime - time of break
 * @returns {Promise<void>} 
 */
function StartBreakTime(blocktime: number, breaktime: number) {
    if (TIME === 0) {
        TIME = blocktime
        StartBlockTime(blocktime, breaktime)
    }
    else {
        isBlockTime = false
        UpdateBlock(false)
        if (GlobalPort) GlobalPort.postMessage("breaktime")

        IntervalId = setInterval(() => {
            if (GlobalPort) GlobalPort.postMessage(TIME)
            browser.storage.local.set({ clock: TIME })
            TIME -= 1
            if (TIME === -1) {
                TIME = blocktime
                clearInterval(IntervalId as NodeJS.Timeout)
                StartBlockTime(blocktime, breaktime)
            }
        }, 1000)
    }
}


/**
 * Delete current timer 
 * @returns {Promise<void>} 
 */
export function DeleteTimer(time: any): void {
    clearInterval(IntervalId as NodeJS.Timeout)
    TimerRuning = false
    UpdateState(false)
}


/**
 * Set all data of timer to begining state 
 * @returns {Promise<void>} 
 */
export function ResetTimer(): void {
    clearInterval(IntervalId as NodeJS.Timeout)
    TimerRuning = false
    UpdateBlock(true)
    UpdateState(false)
    // browser.storage.local.set({ time: 0 })
    browser.storage.local.set({ breaktime: 0 })
    browser.storage.local.set({ blocktime: 0 })
}


/**
 * Fetch tempolary data from browser storage tp popup 
 * @param {function} sendResponse - send response function 
 * @returns {Promise<void>} 
 */
export async function FetchTempolaryData(sendResponse: (response?: any) => void): Promise<void> {
    try {
        const data = await storage.GetDataFromBrowserStorage('temp')
        const response = Object.keys(data).length ? data : undefined
        sendResponse(response)
    }
    catch (error) {

    }
}


/**
 * Get domain name of a url
 * This function is used when update listURL
 * ListURL is a list to store all blocked domain website
 * @param {string | undefined} url - send response function 
 * @returns {string | undefined} return name of domain or undefine if url is incorrect 
 */
function GetDomainURL(url: string | undefined): string | undefined {
    try {
        if (!url) return undefined
        const parseURL = new URL(url)
        const hostname = parseURL.hostname
        return hostname
    }
    catch (error) {
        console.log(error)
        return undefined
    }
}


/**
 * Get information of url: include hostname and name of website
 * This function is used to catagorige url
 * @param {string | undefined} url - send response function 
 * @returns {InfoURL | undefined} return object or undefine if url is incorrect 
 */
export function GetNameWebSite(url: string | undefined): InfoURL | undefined {
    try {
        if (!url) return undefined
        const parseURL = new URL(url)
        const hostname = parseURL.hostname
        const hostnameParts = hostname.split('.')
        const name = hostnameParts.length > 2 ? hostnameParts[1] : hostnameParts[0]
        return {
            name, hostname
        }
    }
    catch (error) {
        console.log(error)
        return undefined
    }
}

/**
 * Catagorize url: distractive or productive ? and name of website 
 * This function is used to catagorige url
 * @param {string | undefined} url - send response function 
 * @returns {InfoURL | undefined} return object or undefine if url is incorrect 
 */
function CatagorizeURL(url: string | undefined): Catagorize | undefined {
    if (!url) return undefined
    const informationURL: InfoURL | undefined = GetNameWebSite(url)
    if (!informationURL) return undefined// if url is incorrect then return 

    let typeURL: string
    let website: string = informationURL.name

    const key = Object.keys(listUrl).find(e => e.includes(informationURL.hostname))
    typeURL = key ? 'distractive' : 'productive'
    return { typeURL, website }
}


/**
 * Increase records in browser storage
 * This function is used to catagorige url
 * @param {string} storageKey - key of browser storage: distractive, productive, weekData
 * @param {string} recordName - name of record to saved: date of week, name of website
 * @param {number} time - amount of unit to increase 
 * @returns {Promise<void>}
 */
async function IncreaseRecord(storageKey: string, recordName: string, time: number): Promise<void> {
    try {
        let { [storageKey]: DataStorage } = await browser.storage.local.get(storageKey)
        if (!DataStorage) DataStorage = { [recordName]: time }
        else {
            DataStorage[recordName] = (DataStorage[recordName] || 0) + time
        }
        console.log(`Saved ${storageKey}`, DataStorage)
        browser.storage.local.set({ [storageKey]: DataStorage })
    }
    catch (error) {
        console.log(error)
    }
}

/**
 * This function clear old setinterval, start new interval to persist data every minutes based on catagorized url
 * if url is a newtab => stop interval, don't track anymore 
 * @param {Catagorize} obj - oject store catagory and name of website url
 * @returns {void}
 */
function TrackTimeOfURL(obj: Catagorize): void {
    try {
        if (TrackTimeInterval) clearInterval(TrackTimeInterval)
        console.log("clear interval")

        const { typeURL, website } = obj
        if (website === 'newtab') return
        let t: number = 15

        TrackTimeInterval = setInterval(async () => {
            console.log(t--)
            if (t === 0) {
                const today = new Date()
                const i: number = today.getDay()
                IncreaseRecord(typeURL, daysOfWeek[i], 1 / 4)
                IncreaseRecord('weekData', website, 1 / 4)
                IncreaseRecord('dailyData', website, 1 / 4)
                t = 15
            }
        }, 1000)  // update record every 60s 
    }
    catch (error) {
        console.log(error)
    }
}

/**
 * This is main function of tracking web-url feature
 * Function catagorige url first, then start interval to persist data 
 * This function is called by background when url is updated 
 * @param {string | undefined} url - oject store catagory and name of website url
 * @returns {void}
 */
export function CollectHistoryData(url: string | undefined): void {
    const obj = CatagorizeURL(url)
    // if url is incorrect, stop track timer and return 
    if (!obj) {
        console.log("clear interval")
        clearInterval(TrackTimeInterval)
        return
    }
    TrackTimeOfURL(obj)
}

/**
 * This is function to fetch data from storage and send to popup to display chart 
 * @param {sendResponse} (any) => void to send data back
 * @returns {void}
 */
export async function FetchHistoryWebsiteData(sendResponse: (response?: any) => void) {
    try {
        const { weekData: website }: { [key: string]: number } = await browser.storage.local.get('weekData')
        const { distractive: distractiveTime }: { [key: string]: number } = await browser.storage.local.get('distractive')
        const { productive: productiveTime }: { [key: string]: number } = await browser.storage.local.get('productive')

        const sortArray = website ? Object.entries(website).sort(([, A], [, B]) => B - A).slice(0, 5) : []
        const timeWebsite = Object.fromEntries(sortArray);

        const ResponseData = { timeWebsite, distractiveTime, productiveTime }
        sendResponse(ResponseData)
    }
    catch (error) {
        console.log(error)
    }
}


/**
 * This is function to fetch data daily from storage and send to popup to display chart 
 * @param {sendResponse} (any) => void to send data back
 * @returns {void}
 */
export async function FetchDataDaily(): Promise<DailyData | undefined> {
    try {
        const { dailyData: data }: { [key: string]: number } = await browser.storage.local.get('dailyData')
        const { distractive: distractiveTime } = await browser.storage.local.get('distractive')
        const { productive: productiveTime } = await browser.storage.local.get('productive')

        const sortArray = data ? Object.entries(data).sort(([, A], [, B]) => B - A).slice(0, 5) : []

        const formatDailyWebsite = sortArray.map(([key, value]) => `${key} : ${(parseFloat(value) / 60).toFixed(3)} hours`).join('\n')

        let i: number = new Date().getDay()
        if (i === 0) i = 6; else i = i - 1
        const response: DailyData = {
            dailywebsite: formatDailyWebsite,
            distractiveTime: distractiveTime?.[daysOfWeek[i]] ? parseFloat((distractiveTime[daysOfWeek[i]] / 60).toFixed(3)) : 0,
            productiveTime: productiveTime?.[daysOfWeek[i]] ? parseFloat((productiveTime[daysOfWeek[i]] / 60).toFixed(3)) : 0
        }
        console.log("daily response", response)
        return response
    }
    catch (error) {
        console.log(error)
        return undefined
    }
}

/**
 * This is function to update setting in storage 
 * This function is called when user update setting in popup 
 * @param {sendResponse} (any) => void to send data back
 * @returns {void}
 */
export async function UpdateSettingData(data: SettingType): Promise<void> {
    try {
        TRACK_HISTORY_WEB = data.trackHistory
        EMAIL = data.email
        DEFAULT_DELAY = data.delay
        USE_EMAIL = data.useEmail
        USE_DELAY = data.useDelay
        browser.storage.local.set({ track_history: data.trackHistory })
        browser.storage.local.set({ useEmail: data.useEmail })
        browser.storage.local.set({ useDelay: data.useDelay })
        browser.storage.local.set({ email: data.email })
        browser.storage.local.set({ default_delay: data.delay })
        console.log("updated!! ", data)
        if (!TRACK_HISTORY_WEB) {
            clearInterval(TrackTimeInterval)
            console.log("Clear interval")
        }
    }
    catch (error) {
        console.log(error)
    }
}

/**
 * This is function to fetch data daily to create email for user 
 * This function is called one times a day to send email 
 * @param {sendResponse} (any) => void to send data back
 * @returns {void}
 */
export async function FetchSettingData(sendResponse: (response?: any) => void): Promise<void> {
    try {
        // load data from storage 
        const { track_history } = await browser.storage.local.get('track_history')
        const { useEmail } = await browser.storage.local.get('useEmail')
        const { useDelay } = await browser.storage.local.get('useDelay')
        const { email } = await browser.storage.local.get('email')
        const { default_delay } = await browser.storage.local.get('default_delay')
        TRACK_HISTORY_WEB = track_history !== undefined ? track_history : true
        USE_EMAIL = useEmail !== undefined ? useEmail : false
        USE_DELAY = useDelay !== undefined ? useDelay : false
        EMAIL = email ? email : ''
        DEFAULT_DELAY = default_delay ? default_delay : ''

        // grab and send
        const response: SettingType = {
            trackHistory: TRACK_HISTORY_WEB,
            useEmail: USE_EMAIL,
            useDelay: USE_DELAY,
            email: EMAIL,
            delay: DEFAULT_DELAY
        }
        console.log("setting data ", response)
        sendResponse(response)
    }
    catch (error) {
        console.log(error)
    }
}



export async function LoadSettingValue() {
    const { track_history } = await browser.storage.local.get('track_history')
    const { useEmail } = await browser.storage.local.get('useEmail')
    const { useDelay } = await browser.storage.local.get('useDelay')
    const { email } = await browser.storage.local.get('email')
    const { default_delay } = await browser.storage.local.get('default_delay')
    TRACK_HISTORY_WEB = track_history !== undefined ? track_history : true
    USE_EMAIL = useEmail !== undefined ? useEmail : false
    USE_DELAY = useDelay !== undefined ? useDelay : false
    EMAIL = email ? email : ''
    DEFAULT_DELAY = default_delay ? default_delay : ''
}

