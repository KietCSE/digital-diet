import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import browser from "webextension-polyfill";
import Timer from '../component/Timer';
import List from '../component/List';
import Button from '../component/Button';
import '../types/ApiType.d'

export default function () {
  const [cards, setCard] = useState<CardType[]>([])

  useEffect(() => {
    const fetchData = async () => {

      const command: ApiType = {
        action: 'fetch-data-cards'
      }

      const api: ApiType = {
        action: 'fetch-tempolary-data'
      }

      try {
        const response = await browser.runtime.sendMessage(command)
        const tempolary = await browser.runtime.sendMessage(api)
        console.log("tempolary data: ", tempolary)
        const list = tempolary ? [tempolary, ...response] : response
        console.log("tempolary list ", list)
        setCard(list)
        console.log("current list ", response)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData()
  }, [])


  return (
    <>
      <Timer />
      <List card={cards} setCard={setCard} />
      <Button setCard={setCard} />
    </>
  )
}
