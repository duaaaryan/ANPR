import React, { useState, useEffect } from 'react';

const CSVReader = () => {
  const [dataRaw, setDataRaw] = useState([]);
  const [dataIntp, setDataIntp] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/test.csv'); // Path to the CSV file
      const text = await response.text();
      const rows = text.split('\n').map(row => row.split(','));
      setDataRaw(rows);

      const responseIntp = await fetch('/test_interpolated.csv'); // Path to the CSV file
      const textIntp = await responseIntp.text();
      const rowsIntp = textIntp.split('\n').map(row => row.split(','));
      setDataIntp(rowsIntp)
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Fetch data every 10,000 milliseconds (10 seconds)

    return () => clearInterval(interval);
  }, []);

  // Function to handle CSV download
  const handleDownloadRaw = () => {
    const csvContent = dataRaw.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadIntp = () => {
    const csvContent = dataIntp.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-interpolated.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
        <div className='text-left m-auto items-start max-w-[1420px]'>
      <button
        className="bg-zinc-800 hover:bg-zinc-700 border-zinc-900 border-2 font-semibold text-sm text-white rounded-md px-4 mr-auto py-2 mt-4 mb-2"
        onClick={handleDownloadRaw}
      >
        Download Raw CSV
      </button>
      <button
        className="bg-slate-800 hover:bg-slate-700 ml-4 border-slate-900 border-2 font-semibold text-sm text-white rounded-md px-4 mr-auto py-2 mt-4 mb-2"
        onClick={handleDownloadIntp}
      >
        Download Interpolated CSV
      </button>
      </div>
      <table className="m-auto mt-2 rounded max-w-[1420px] overflow-scroll">
        <thead className="rounded-xl">
          <tr>
            <th>Frame Number</th>
            <th>Car ID</th>
            <th>Car bBox</th>
            <th>License Plate bBox</th>
            <th>License bBox Confidence</th>
            <th>License Plate Text</th>
            <th>License Text Confidence</th>
          </tr>
        </thead>
        <tbody className="items-center  m-auto rounded-xl">
          {dataRaw.map((row, index) =>
            index !== 0 ? (
              <tr
                className={index % 2 === 0 ? 'bg-indigo-700' : 'bg-blue-900'}
                key={index}
              >
                {row.map((cell, cellIndex) => (
                  <td className="truncate max-w-xs pr-8 pl-2 pt-2 pb-2" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ) : (
              <h1 key={index}></h1>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CSVReader;
