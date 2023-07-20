import React, { useState, useEffect } from 'react';

const ImageDisplay = () => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Fetch or generate the URL for the image
    const fetchImageUrl = async () => {
      const response = await fetch('/Users/aaryandua/Downloads/FullStack ANPR/fullstack_anpr/image.png');
      const data = await response.json();
      setImageUrl(data.imageUrl);
    };

    // Call the fetchImageUrl function initially and set an interval to update the image URL periodically
    fetchImageUrl();
    const interval = setInterval(fetchImageUrl, 800); // Update every 800 milliseconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {imageUrl && <img src={imageUrl} alt="Dynamic Image" />}
    </div>
  );
};

export default ImageDisplay;
