import browser from "webextension-polyfill";

/**
 * Save data to storage of browser (save on disk)
 * @param {string} key - key of data
 * @param {object} data - data
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function SaveToBrowserStorage(key: string, data: any): Promise<boolean> {
    try {
        await browser.storage.local.set({ [key]: data })
        return true
    }
    catch (error) {
        console.log("Error saving to browser ", error)
        return false
    }
}


/**
 * Getting data from browser storage 
 * @param {string} key - key of data
 * @returns {Promise<object>} - return data if exit, Nan if not 
*/
export async function GetDataFromBrowserStorage(key: string): Promise<object> {
    try {
        const response = await browser.storage.local.get(key)
        return response[key] !== undefined ? response[key] : {}
    }
    catch (error) {
        console.log('Error getting data from browser ', error)
        return {}
    }
}


/**
 * Clear data stored in browser (save on disk)
 * @param {string} key - key of data
 * @returns {Promise<boolean>} - return false if error occur, true if not 
 */
export async function ClearAll(key: string): Promise<boolean> {
    try {
        await browser.storage.local.set({ [key]: undefined })
        console.log("removed!!")
        return true
    }
    catch (error) {
        console.log("Error clearing data ", error)
        return false
    }
}