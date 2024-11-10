import React, { useEffect, useRef } from 'react'
import ChartJS, { ChartData, Chart } from 'chart.js/auto'

type Title = {
      name: string;
      dataset: ChartData<'bar', number[], string>;

}

const ChartComponent = ({ name, dataset }: Title) => {
      const chartRef = useRef<HTMLCanvasElement | null>(null);
      const chartInstanceRef = useRef<Chart | null>(null); // Ref để giữ biểu đồ hiện tại

      useEffect(() => {
            if (chartRef.current) {
                  if (chartInstanceRef.current) {
                        chartInstanceRef.current.destroy(); // Hủy biểu đồ cũ nếu tồn tại
                  }

                  const yScaletopLabel = {
                        id: 'yScaletopLabel',
                        beforeDatasetsDraw(chart: Chart, args: any, plugins: any) {
                              const { ctx, scales: { y } } = chart;
                              const yCenter = (y.right + 4) / 2;
                              ctx.save();
                              ctx.textAlign = 'center'
                              ctx.textBaseline = 'bottom'
                              ctx.fillText('Hours', yCenter, y.top - 12)
                        }
                  }

                  // Tạo biểu đồ mới
                  chartInstanceRef.current = new ChartJS(chartRef.current, {
                        type: 'bar',
                        data: dataset,
                        options: {
                              scales: {
                                    y: {
                                          beginAtZero: true,
                                    }
                              }
                        },
                        plugins: [yScaletopLabel]
                  });
            }

            // Cleanup để hủy biểu đồ khi component bị unmount
            return () => {
                  if (chartInstanceRef.current) {
                        chartInstanceRef.current.destroy();
                  }
            }
      }, [dataset]); // Lắng nghe sự thay đổi của dataset

      return (
            <div className='mt-4 px-4 py-2 h-2/5 flex flex-col'>
                  <span className='text-lg py-2 text-center flex-[1]'>{name}</span>
                  <div className='flex items-center justify-center flex-[4]'>
                        <canvas ref={chartRef} id="acquisitions" />
                  </div>
            </div>
      )
}

export default ChartComponent;
