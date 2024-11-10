import React, { useState } from 'react'

type Feature = {
    name: string,
    desc: string,
    setValue: () => void,
    value: any
}

const Toggle = ({ name, desc, setValue, value }: Feature) => {

    const toggleSwitch = () => {
        setValue()
    };

    return (
        <div>
            <div className='flex px-6 pt-6 justify-between items-center'>
                <span className='text-lg font-bold'>{name}</span>
                <button
                    onClick={toggleSwitch}
                    className={`w-16 h-7 flex items-center px-1 rounded-full relative focus:outline-none transition duration-200 ${value ? 'bg-tick-color' : 'bg-gray-300'
                        }`}
                >
                    {/* Text: ON or OFF */}
                    <span
                        className={`absolute text-xs left-2 font-bold transition duration-300 ${value ? 'opacity-100 text-white' : 'opacity-0'
                            }`}
                    >
                        ON
                    </span>
                    <span
                        className={`absolute text-xs right-2 font-bold transition duration-300 ${!value ? 'opacity-100 text-white' : 'opacity-0'
                            }`}
                    >
                        OFF
                    </span>

                    {/* Toggle Circle */}
                    <span
                        className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 transform ${value ? 'translate-x-9' : 'translate-x-0'
                            }`}
                    ></span>
                </button>
            </div>
            <p className='px-6 py-4 text-base'>{desc}</p>
        </div>
    )
}

export default Toggle
