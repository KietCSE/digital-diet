import React, { useState } from 'react'

type Functional = {
    setTab: (index: number) => void;
}

const Header = ({ setTab }: Functional) => {

    const [selected, setSelected] = useState(0);

    function HandleClideHeader(index: number) {
        setSelected(index);
        setTab(index)
    }

    return (
        <header className='grid grid-cols-3 gap-0 h-[50px]'>
            <div className={`text-lg bg-header-color text-center flex justify-center items-center cursor-pointer ${selected === 0 ? 'bg-press-color' : ''} `}
                onClick={() => HandleClideHeader(0)}>
                Focus
            </div>

            <div className={`text-lg bg-header-color text-center flex justify-center items-center cursor-pointer ${selected === 1 ? 'bg-press-color' : ''} `}
                onClick={() => HandleClideHeader(1)}>
                Analysis
            </div>

            <div className={`text-lg bg-header-color text-center flex justify-center items-center cursor-pointer ${selected === 2 ? 'bg-press-color' : ''} `}
                onClick={() => HandleClideHeader(2)}>
                Setting
            </div>

        </header>
    )
}

export default Header
