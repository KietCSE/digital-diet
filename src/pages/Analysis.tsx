import React, { useEffect, useState } from 'react'
import Chart from '../component/Chart'
import browser from "webextension-polyfill";
import { ChartData, ChartOptions } from 'chart.js/auto'


const Analysis = () => {

      const [dataset1, setDataset1] = useState<ChartData<'bar', number[], string>>({
            labels: [],
            datasets: []
      });

      const [dataset2, setDataset2] = useState<ChartData<'bar', number[], string>>({
            labels: [],
            datasets: []
      });

      useEffect(() => {
            (async () => {
                  const api: ApiType = {
                        action: "fetch-chart-data"
                  }
                  const data = await browser.runtime.sendMessage(api)
                  console.log("chart data: ", data)

                  //data for chart 1 
                  const labels1 = data.timeWebsite ? Object.keys(data.timeWebsite) as string[] : []
                  const temp = data.timeWebsite ? Object.values(data.timeWebsite) as number[] : []
                  const dataset1: number[] = temp.map(value => parseFloat((value / 60).toFixed(3)))
                  const data1 = {
                        labels: labels1,
                        datasets: [
                              {
                                    label: 'Time of url',
                                    data: dataset1,
                                    // backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    // borderColor: 'rgba(75, 192, 192, 1)',
                                    // borderWidth: 1
                              }
                        ]
                  };


                  //data for chart 2 
                  const labels2 = ['Monday', 'Tuesday', "Wednesday", 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  const labels4 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  let dataset2: number[] = [0, 0, 0, 0, 0, 0, 0]
                  if (data.distractiveTime) {
                        Object.entries(data.distractiveTime).forEach(([key, value]) => {
                              const index = labels2.findIndex(label => label === key)
                              if (index !== -1 && typeof value === 'number') dataset2[index] = parseFloat((value / 60).toFixed(3))
                        })
                  }

                  let dataset3: number[] = [0, 0, 0, 0, 0, 0, 0]
                  if (data.productiveTime) {
                        Object.entries(data.productiveTime).forEach(([key, value]) => {
                              const index = labels2.findIndex(label => label === key)
                              if (index !== -1 && typeof value === 'number') dataset3[index] = parseFloat((value / 60).toFixed(3))
                        })
                  }

                  const data2 = {
                        labels: labels4,
                        datasets: [
                              {
                                    label: 'Distractive',
                                    data: dataset2,
                                    // backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    // borderColor: 'rgba(255, 99, 132, 1)',
                                    // borderWidth: 1
                              },
                              {
                                    label: 'Productive',
                                    data: dataset3,
                                    // backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                    // borderColor: 'rgba(54, 162, 235, 1)',
                                    // borderWidth: 1
                              }
                        ]
                  };
                  //option for chart 2

                  console.log(data1)
                  console.log(data2)

                  setDataset1(data1)
                  setDataset2(data2)

            })()

      }, [])

      return (
            <>
                  <Chart name="THE MOST VISITED WEBSITES THIS WEEK" dataset={dataset1} />
                  <Chart name="PRODUCTIVE AND DISTRACTIVE WEBSITES" dataset={dataset2} />
            </>
      )
}

export default Analysis
