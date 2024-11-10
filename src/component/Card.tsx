import React, { useEffect, useState } from 'react'
import browser from "webextension-polyfill";
import { useTimer } from '../pages/TimerProvider'
import '../types/ApiType.d'

type Functional = {
    setCard: React.Dispatch<React.SetStateAction<CardType[]>>,
    card: CardType
}

const Card = ({ setCard, card }: Functional) => {

    const [create, setCreate] = useState<boolean>(true)   // display create button or not 
    const [target, setTarget] = useState<string>('')      //
    const [redirect, setRedirect] = useState<string>('')  //

    const { sendData } = useTimer()

    // add more card component 
    const DeleteCard = () => {
        //delete card 
        setCard(prevCard => prevCard.filter((element) => element.index !== card.index))
        // delete card which is not created 
        if (create) {
            const api: ApiType = { action: 'remove-tempolary-data' }
            browser.runtime.sendMessage(api)
            return
        }
        // send request to store new card 
        const removedCard: ApiType = {
            action: 'remove-card',
            data: card.index
        }
        browser.runtime.sendMessage(removedCard)
    }

    //send request to create new card in background 
    const CreateNewCard = () => {
        console.log('target before create: ', target)
        if (!target) return
        setCreate(false)
        const newCard: CardType = { index: card.index, target, redirect }
        const createNewCard: ApiType = {
            action: 'create-new-card',
            data: newCard
        }
        //call function in background to save card 
        browser.runtime.sendMessage(createNewCard)
        //update list card of client 
        setCard(prev => {
            const update = [...prev]
            update[0] = newCard
            return update
        })
    }

    // set value for card when rendering 
    useEffect(() => {
        if (card.tempolary) {
            if (card.target) setTarget(card.target);
            if (card.redirect) setRedirect(card.redirect);
            setCreate(true);
        }
        else if (card.target) {
            if (card.target) setTarget(card.target);
            if (card.redirect) setRedirect(card.redirect);
            setCreate(false);
        } else {
            setCreate(true);
            setTarget('')
            setRedirect('')
        }
    }, [card]);

    return (
        <div className='mb-2 bg-card-color px-3 py-2 rounded-2xl flex flex-col gap-2 justify-center items-center'>
            <div className='flex items-center justify-center'>
                <span className='w-20 flex-[2] text-base'>Target</span>
                <input
                    type="text"
                    placeholder='URL'
                    readOnly={!create}
                    value={target}
                    // send temporary data through pipline to background 
                    onChange={(e) => { sendData('change-target', e.target.value, card.index); setTarget(e.target.value) }}
                    className={`flex-[5] py-1 px-2 text-base rounded-xl focus:outline-none ${!create ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                />
            </div>

            <div className='flex items-center justify-center'>
                <span className='w-20 flex-[2] text-base'>Redirect</span>
                <input
                    type="text"
                    placeholder='URL'
                    readOnly={!create}
                    value={redirect}
                    // send temporary data through pipline to background 
                    onChange={(e) => { sendData('change-redirect', e.target.value, card.index); setRedirect(e.target.value) }}
                    className={`flex-[5] py-1 px-2 text-base rounded-xl focus:outline-none ${!create ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                />
            </div>
            <div className='flex gap-7 w-full justify-center items-center'>
                <button
                    onClick={CreateNewCard}
                    className={`hover:bg-tick-color rounded-2xl w-1/4 ${!create ? 'hidden' : ''}`}
                >
                    Create
                </button>

                <button
                    onClick={DeleteCard}
                    className={`hover:bg-orange-400 rounded-2xl w-1/4 ${create ? '' : ''}`}
                >
                    Delete
                </button>
            </div>

        </div>
    )
}

export default Card
