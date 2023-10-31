# Automatic Number Plate Recognition (ANPR) Software

This README.md file provides detailed information about an Automatic Number Plate Recognition (ANPR) software implemented in Python using various libraries and technologies, including OpenCV, YOLO, SORT algorithm, EasyOCR, Haar Cascade, and more.

## Overview

The ANPR software is designed to detect and recognize license plates in videos. It uses several components to achieve this, including object detection, license plate detection, and character recognition.

## Components and Technologies Used

### Python Libraries and Frameworks

- [Flask](https://flask.palletsprojects.com/en/2.1.x/): Used for creating a web application to interact with the software.
- [OpenCV](https://opencv.org/): Utilized for image and video processing.
- [YOLO (You Only Look Once)](https://github.com/ultralytics/yolov5): Employed for object detection, which includes car and license plate detection.
- [SORT (Simple Online and Realtime Tracking)](https://github.com/abewley/sort): Used for tracking objects over frames.
- [EasyOCR](https://github.com/JaidedAI/EasyOCR): Applied for recognizing characters on license plates.
- Haar Cascade: A machine learning object detection method used for various purposes, including detecting license plates.
- Ultralytics: Utilized for managing and configuring the YOLO model.

### Other Libraries

- [Pandas](https://pandas.pydata.org/): Used for data manipulation and storage.
- [Requests](https://docs.python-requests.org/en/latest/): Employed for sending HTTP requests.
- [csv](https://docs.python.org/3/library/csv.html): Used for working with CSV files.
- [numpy](https://numpy.org/): Used for numerical operations.
- [torch](https://pytorch.org/): Required for deep learning models (YOLO).
- [Roboflow](https://docs.roboflow.com/docs/api): Utilized for accessing data via API.
- [dnn_superres](https://github.com/opencv/opencv/pull/18093): Used for super-resolution.
- [PIL (Pillow)](https://pillow.readthedocs.io/en/stable/index.html): Employed for image processing.

### JavaScript Framework

- [React](https://reactjs.org/): Used for the front-end user interface.

## Usage

The ANPR software can be used for the following purposes:

1. **Video Upload**: The software allows users to upload a video file for license plate recognition. The file is then processed by the backend.

2. **License Plate Recognition**: The software processes the video frames, detects vehicles, and recognizes license plates using YOLO and EasyOCR.

3. **Visualization**: The software visualizes the recognition results by drawing bounding boxes around vehicles and license plates and displaying the recognized license plate text.

4. **Data Storage**: The results, including frame number, car ID, bounding boxes, license plate information, and confidence scores, are stored in a CSV file.

5. **Vahan Verification**: The software checks the confidence score of the recognized license plate text and verifies it against a threshold and then checks it using Api setu's parivahan API. If the confidence is above the threshold and is verified using the API key is provided, it marks the recognition as "Vahan Verified." 




**THE API KEY HAS BEEN REMOVED DUE TO SECURITY PURPOSES**




6. **Interpolation**: The software interpolates missing data in the results and adds a "Vahan Verified" field to the CSV file.

7. **Download Visualized Video**: Users can download the visualized video with bounding boxes and recognized license plate information.

## Frontend

The frontend of the ANPR software is developed using React. It provides a user-friendly interface for uploading videos, visualizing results, and downloading the visualized video.

The frontend allows users to:

- Upload video files for processing.
- Visualize the processing status.
- View license plate crops.
- Download the visualized video.
- Check processing time.

## Installation and Deployment

To deploy and run this ANPR software, follow these steps:

1. Install the required Python libraries using pip:

   ```bash
   pip install flask flask-cors requests opencv-python-headless numpy pandas easyocr torch roboflow opencv-python-headless
   ```

2. Clone the [SORT repository](https://github.com/abewley/sort) and add it to your project.

3. Clone the [YOLO repository](https://github.com/ultralytics/yolov5) and add it to your project.

4. Set up a React project for the frontend by running:

   ```bash
   npx create-react-app anpr-frontend
   ```

   Replace the contents of `src` directory in the React project with your frontend code.

5. Create the required folders and configure paths and API keys as needed.

6. Start the Flask backend by running:

   ```bash
   python server.py
   ```

7. Start the React frontend after creating a build version by running:

   ```bash
   npm start
   ```

8. Access the web application in your browser at `http://localhost:3000`.

## API Usage

The ANPR software provides the following API endpoints:

- `/data`: Accepts a video file for processing and storing the results.

- `/visualize`: Processes the video, visualizes it, and stores the results.

- `/download`: Allows users to download the visualized video.

- `/status`: Provides the processing status.

## License

This ANPR software is provided under the [MIT License](LICENSE). Feel free to modify and use it according to your requirements.

---

Please make sure to adapt the paths, API keys, and configurations according to your specific setup and requirements. The provided code is a high-level overview of the software and may require additional adjustments for your environment.