import React, { useEffect } from 'react'
import Card from './Card'

const List = ({ card, setCard }: { card: CardType[], setCard: React.Dispatch<React.SetStateAction<CardType[]>> }) => {

    console.log(card)

    return (
        <div className="py-2 px-5 flex-1 overflow-y-auto custom-scrollbar text-center">
            {
                card.length == 0 ?
                    <div className='text-base w-full h-full flex justify-center items-center'>
                        <p>Empty</p>
                    </div>
                    :
                    card.map((element, index) => (
                        <Card key={index} card={element} setCard={setCard} />
                    ))
            }
        </div>
    )
}

export default List
