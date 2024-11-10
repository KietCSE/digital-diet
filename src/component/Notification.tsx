import React, { useState, useEffect } from 'react'

type Feature = {
    name: string,
    desc: string,
    field: string,
    setValue: () => void,
    setBlur: (key: string) => void,
    value: any,
    isUse: boolean
}

const Notification = ({ name, desc, field, setValue, setBlur, value, isUse }: Feature) => {

    const toggleSwitch = () => {
        if (setValue) setValue()
    };

    return (
        <div>
            <div className='mt-1 flex px-6 pt-6 justify-between items-center'>
                <span className='text-lg font-bold'>{name}</span>
                <button
                    onClick={toggleSwitch}
                    className={`w-16 h-7 flex items-center px-1 rounded-full relative focus:outline-none transition duration-200 ${isUse ? 'bg-tick-color' : 'bg-gray-300'
                        }`}
                >
                    {/* Text: ON or OFF */}
                    <span
                        className={`absolute text-xs left-2 font-bold transition duration-300 ${isUse ? 'opacity-100 text-white' : 'opacity-0'
                            }`}
                    >
                        ON
                    </span>
                    <span
                        className={`absolute text-xs right-2 font-bold transition duration-300 ${!isUse ? 'opacity-100 text-white' : 'opacity-0'
                            }`}
                    >
                        OFF
                    </span>

                    {/* Toggle Circle */}
                    <span
                        className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 transform ${isUse ? 'translate-x-9' : 'translate-x-0'
                            }`}
                    ></span>
                </button>
            </div>
            <input
                type="text"
                placeholder={field}
                value={value}
                onChange={(e) => setBlur(e.target.value)}
                className='my-2 mx-6 px-4 py-2 text-base w-2/3 bg-slate-200 rounded-lg focus:outline-none'
            />
            <p className='px-6 py-1 text-base'>{desc}</p>
        </div>
    )
}

export default Notification
