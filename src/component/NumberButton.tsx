import React, { useState } from 'react'

type Functional = {
      setTimer: (time: number) => void;
      time: number
}


const NumberButton = ({ setTimer, time }: Functional) => {

      const [count, setCount] = useState(0);

      const increment = () => {
            setTimer(0.1)
      }
      const decrement = () => {
            if (time > 0) setTimer(-0.1)
      };

      return (
            <div className="flex items-center space-x-3 rounded overflow-hidden">
                  <button
                        onClick={decrement}
                        className="bg-header-color text-black font-bold h-6 w-6 rounded-full  hover:bg-blue-500 flex items-center justify-center"
                  >
                        -
                  </button>

                  <span className="text-xs font-semibold w-auto">{time / 60} min</span>

                  <button
                        onClick={increment}
                        className="bg-header-color text-black font-bold h-6 w-6 rounded-full hover:bg-blue-500 flex items-center justify-center"
                  >
                        +
                  </button>
            </div>
      );
}

export default NumberButton
