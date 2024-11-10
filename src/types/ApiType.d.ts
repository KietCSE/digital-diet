
type ApiType = {
    action: string,
    data?: any,
}

type CardType = {
    index: number,
    target: string,
    redirect: string,
    tempolary?: boolen
}

type InfoURL = {
    name: string,
    hostname: string
}

type Catagorize = {
    typeURL: string,
    website: string
}

type DailyData = {
    dailywebsite: any,
    distractiveTime: number,
    productiveTime: number
}

type SettingType = {
    trackHistory: boolean,
    useEmail: boolean,
    useDelay: boolean
    email: string,
    delay: number
}