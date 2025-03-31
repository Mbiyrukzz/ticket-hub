import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const TicketStatusChart = ({ ticketData }) => {
  const defaultData = { open: 0, closed: 0, inProgress: 0 }
  const data = ticketData || defaultData

  const colors = {
    open: 'rgba(59, 130, 246, 0.9)', // Blue-500
    closed: 'rgba(239, 68, 68, 0.9)', // Red-500
    inProgress: 'rgba(234, 179, 8, 0.9)', // Yellow-500
  }

  const chartData = {
    labels: ['Open', 'Closed', 'In Progress'],
    datasets: [
      {
        label: 'Ticket Status',
        data: [data.open, data.closed, data.inProgress],
        backgroundColor: [colors.open, colors.closed, colors.inProgress],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: { size: 14 },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
    animation: { duration: 1000 }, // Reduced animation
  }

  return (
    <div className="w-full md:w-1/2 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md h-56 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800">
        <h5 className="text-lg font-semibold text-blue-600 dark:text-yellow-400 mb-4 text-center">
          Ticket Status Distribution
        </h5>
        <div className="w-40 h-40">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}

export default TicketStatusChart
