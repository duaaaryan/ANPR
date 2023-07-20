import React, { useState } from 'react';
import axios from 'axios'
const fetch = require('node-fetch');
import AddIcon from '@mui/icons-material/Add';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import { useEffect } from 'react';
import CSVReader from '../Components/CSVReader';
import star from '../public/star.png'

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadClicked, setUploadClicked] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [cropImageThresholdUrl, setCropImageThresholdUrl] = useState('')
  const [visualizedVideo , setVisualizedVideo] = useState(false)
  const [loading, setLoading] = useState(false);
  console.log(videoFile)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
  };

  async function handleUpload(){
    try{
      const options = {
        method: "PUT",
        headers: {
          AccessKey: "47cd7769-c1df-47e1-a61218e69ab6-55e4-4c8a",
          "Content-Type": "application/octet-stream",
        },
        body: videoFile,
      };

      setUploadClicked(true);
      const url = `https://storage.bunnycdn.com/swift/path/${videoFile.name}`;
      const urlForShow = `https://swift-force.b-cdn.net/path/${videoFile.name}`;

      fetch(url, options)
        .then((response) => response.text())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("api_key", process.env.BUNNY_CDN);
      // make an axios.post request, passing in formData as the second argument

      await axios.post('http://127.0.0.1:3000/data', {url:url}).then((res) => {
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
      console.log("File uploaded successfully");
    } catch (error) {
      console.error(error);
    }


  };

  // an async function that sends a post request to 172.0.0.1:3000/visualize with the video file name as the body
  async function visualizeVideo(){
    try{
      await axios.post('http://127.0.0.1:3000/visualize', videoFile? {videoFile: videoFile.name} : {videoFile: 'iscon_p1_l2.mp4'}).then((res) => {
      setVisualizedVideo(true)


        console.log(res)
      }).catch((err) => {
        console.log(err)
      })

    } catch (error) {
      console.error(error);
    }
  }

  function handleDownload(){
    window.open('/api/download', '_blank'); // Open the download link in a new tab/window
  };

  




  function checkProcessingStatus(){

  }



  useEffect(() => {
    const fetchImageUrl = () => {
      const startTime = Date.now();

      const imagePath = `/image.png`;
      const cropPath = `/license_plate.png`
      const cropThresholdPath = `/license_plate_thresh.png` // Replace with your image extension
      setImageUrl(`${imagePath}?t=${Date.now()}`);;
      setCropImageThresholdUrl(`${cropThresholdPath}?t=${Date.now()}`);;
      setCropImageUrl(`${cropPath}?t=${Date.now()}`);;
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      setProcessingTime(timeTaken)
    };

    fetchImageUrl();
    checkProcessingStatus()
    const interval = setInterval(fetchImageUrl, 800);
    const interval2 = setInterval(checkProcessingStatus, 8000);

    return () => clearInterval(interval, interval2);



  }, []);


    const [isScrolled, setIsScrolled] = useState(false);
  
    // Function to handle scroll event
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setIsScrolled(scrolled);
    };
  
    useEffect(() => {
      // Add event listener for scroll
      window.addEventListener('scroll', handleScroll);
      return () => {
        // Clean up the event listener on unmount
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  



  return (
    <div clas>
    <header className={`p-4 flex items-left fixed w-full top-0 transition-all ${isScrolled ? 'bg-zinc-800/40 backdrop-blur-lg text-white border-gray-700 shadow-xl' : 'bg-blue-700'}`}>
      <h1 className="font-bold text-2xl">ANPR Demo</h1>
      <ul className="flex italic items-center m-auto">
        <li className="mr-16">Avg. 2198 ms per frame</li>
        <li className="mr-16">Car, Bike, Truck, Bus, and Person detection</li>
        <li className="mr-8">62% Accuracy</li>
      </ul>
    </header>
      {imageUrl && uploadClicked ? (
        <div className="m-auto text-center p-16 pt-32">
          {imageUrl && videoFile ? (
            <img
              src={imageUrl}
              alt="Dynamic Image"
              className="max-w-7xl m-auto  mb-4 rounded-xl shadow-neon "
            />
          ) : 
          (
          <video className='max-w-7xl m-auto mb-4 rounded-xl shadow-neon border-4 border-zinc-900' autoPlay muted loop>
            <source src="/output.mp4" type="video/mp4" />
          </video>

          )}
          <h1 className="m-auto font-semibold text-5xl">
            Video File: {videoFile ? videoFile.name : "output.mp4"}
          </h1>
          <span className="block mt-4 text-md">
            Processing Taken: {processingTime && processingTime}ms
          </span>
          <div className='rounded-xl bg-zinc-800 border-2 border-zinc-900 p-1 max-w-xl m-auto'>
          <div className="flex items-center m-auto justify-center mt-4 mb-4">
            <h2 className="my-auto font-semibold text-2xl">
              License Plate Crop:
            </h2>
            {cropImageUrl && (
              <img
                src={cropImageUrl}
                alt="Dynamic Image"
                className="w-[160px] ml-4 h-[50px] object-cover my-auto  border-2 border-white  rounded-md shadow-neon "
              />
            )}
          </div>
          <div className="flex items-center m-auto justify-center mt-8 mb-4">
            <h2 className="my-auto font-semibold text-2xl">
              License Plate Threshold Crop:
            </h2>
            {cropImageUrl && (
              <img
                src={cropImageThresholdUrl}
                alt="Dynamic Image"
                className="w-[160px] ml-4 h-[50px] object-cover my-auto  rounded-md shadow-neon border-2 border-white "
              />
            )}
          </div>
          </div>
          {processingStatus ? (
            <span className="text-xl italic font- m-auto">Processing...</span>
          ) : (
            <div className=" grid items-center text-center">
              {!visualizedVideo && (
                <div>
                  <button
                    className={` max-w-[300px] m-auto border-2 border-zinc-900 hover:bg-blue-800 focus:animate-spin inline-flex items-center px-4 py-2 font-semibold  leading-6 text-sm shadow rounded-md text-white mb-8 mt-8 ${loading ? 'hidden' : ''} ${isScrolled ? ' transition-all bg-gradient-to-br from-green-500 via-blue-600 to-purple-500': ' transition-all bg-neutral-800'}`}

                    onClick={() => {
                      visualizeVideo();
                      setLoading(true);
                    }}
                  >
                    <img src={'/star-3.png'} className='h-auto w-[24px] '/>Visualize Video
                  </button>
                {loading &&
                  <div class="flex items-center justify-center">
                    <button
                      type="button"
                      class="inline-flex items-center border-2 border-zinc-900 px-4 py-2 mb-8 mt-8 font-semibold leading-6 text-sm shadow rounded-md  bg-gradient-to-br text-white from-green-500 via-blue-600 to-purple-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed"
                      disabled=""
                    >
                      <svg
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </button>
                  </div>
                  }
                </div>
              
              )}
              {visualizedVideo && (
                <div>
                  <button className="  max-w-[260px] m-auto border-2 border-zinc-900  mb-6 inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md bg-indigo-600 hover:bg-indigo-600 text-white  mt-8" onClick={handleDownload}>
                    Download Visualized Video
                  </button>
                  <button
                    class="animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 m-auto dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center"
                    onClick={handleDownload}
                  >
                    <svg
                      class="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
          <CSVReader />
        </div>
      ) : (
        <div className=" max-w-4xl h-[600px] p-48 m-auto bg-zinc-900  mt-32 rounded-xl  items-center text-center justify-center" >
          <div className="flex mb-6 items-center">
            <input
              type="file"
              accept="video/mp4"
              className=" file:bg-indigo-700 file:p-2 file:border-0 file:rounded file:hover:bg-indigo-700 inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm  rounded-md text-white"
              onChange={handleFileChange}
            />
            <button
              className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-700 hover:bg-blue-800 "
              onClick={handleUpload}
            >
              <AddIcon className="text-white " />
              Upload Video
            </button>
          </div>
          <button
            className=" bg-cyan-600 hover:bg-cyan-700 inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white"
            onClick={() => setUploadClicked(true)}
          >
            Show Previously Processed Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
