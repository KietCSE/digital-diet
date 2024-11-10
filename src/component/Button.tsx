import React, { useRef } from 'react'

const Button = ({ setCard }: { setCard: React.Dispatch<React.SetStateAction<CardType[]>> }) => {

      const handleClick = () => {
            setCard(prev => {
                  if (prev.length === 0 || (prev[0].target !== '' && !prev[0].tempolary)) {
                        const i: number = prev.length === 0 ? 0 : prev[0].index + 1
                        const data: CardType = {
                              index: i,
                              target: '',
                              redirect: ''
                        }
                        return [data, ...prev]
                  }
                  else return prev
            })
      }

      return (
            <div className='h-[50px] flex items-center justify-center'>
                  <button onClick={handleClick} className='bg-press-color rounded-xl mx-5 h-[30px] w-full hover:bg-blue-600'>Add more</button>
            </div>
      )
}

export default Button
