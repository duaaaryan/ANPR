from flask import Flask, render_template, request, jsonify
import datetime
from flask_cors import CORS
import requests
from ultralytics import YOLO
import cv2
from add_missing_data import interpolate_bounding_boxes
import util
from sort import *
from util import get_car, read_license_plate, write_csv
import csv
import torch
from roboflow import Roboflow
from cv2 import dnn_superres
from PIL import Image
import time
import ast
import pandas as pd

x = datetime.datetime.now()

# Initializing Flask app
app = Flask(__name__)
# Allow axios.post requests
CORS(app, supports_credentials=True)

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'processing'})


@app.route('/visualize', methods=['POST'])
def visualize():
    results = pd.read_csv('/Users/aaryandua/Downloads/FullStack ANPR/fullstack_anpr/public/test_interpolated.csv')
    # get file url from post request
    filename = request.json['videoFile']
    video_path = '/Users/aaryandua/Downloads/FullStack ANPR/fullstack_anpr/iscon_p1_l2.mp4'
    cap = cv2.VideoCapture(video_path)
    out = cv2.VideoWriter('public/output.mp4', cv2.VideoWriter_fourcc(*'MP4V'), 15, (1920, 1080))
    fps = cap.get(cv2.CAP_PROP_FPS)
    print('fps: ', fps)
    license_plate = {}
    for car_id in np.unique(results['car_id']):
        max_ = np.amax(results[results['car_id'] == car_id]['license_number_score'])
        license_plate[car_id] = {'license_crop': None,
                                'license_plate_number': results[(results['car_id'] == car_id) &
                                                                (results['license_number_score'] == max_)]['license_number'].iloc[0]}
        cap.set(15, results[(results['car_id'] == car_id) &
                                                (results['license_number_score'] == max_)]['frame_nmr'].iloc[0])
        ret, frame = cap.read()
        
        x1, y1, x2, y2 = ast.literal_eval(results[(results['car_id'] == car_id) &
                                                (results['license_number_score'] == max_)]['license_plate_bbox'].iloc[0].replace('[ ', '[').replace('   ', ' ').replace('  ', ' ').replace(' ', ','))

        license_crop = frame[int(y1):int(y2), int(x1):int(x2), :]
        license_crop = cv2.resize(license_crop, (int((x2 - x1) * 400 / (y2 - y1)), 400))

        license_plate[car_id]['license_crop'] = license_crop


    frame_nmr = -1

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    # read frames
    ret = True
    while ret:
        ret, frame = cap.read()
        frame_nmr += 1
        if ret:
            df_ = results[results['frame_nmr'] == frame_nmr]
            for row_indx in range(len(df_)):
                # draw car
                car_x1, car_y1, car_x2, car_y2 = ast.literal_eval(df_.iloc[row_indx]['car_bbox'].replace('[ ', '[').replace('   ', ' ').replace('  ', ' ').replace(' ', ','))
                cv2.rectangle(frame, (int(car_x1), int(car_y1)), (int(car_x2), int(car_y2)), (0, 255, 0), 12)

                # draw license plate
                x1, y1, x2, y2 = ast.literal_eval(df_.iloc[row_indx]['license_plate_bbox'].replace('[ ', '[').replace('   ', ' ').replace('  ', ' ').replace(' ', ','))
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 4)
                cv2.putText(frame, license_plate[df_.iloc[row_indx]['car_id']]['license_plate_number'], (int(x1), int(y1)-6), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 2)
                # crop license plate
                license_crop = license_plate[df_.iloc[row_indx]['car_id']]['license_crop']



            out.write(frame)
    cap.release()
    return jsonify({'filename': 'output.mp4'})    
    


# Route for handling data
@app.route('/data', methods=['POST'])
def handle_data():
    # Get the url data from the request, assuming it has been sent as a JSON object
    url = request.json['url']
    print('the url:', url)

    headers = {
        "accept": "*/*",
        "AccessKey": "47cd7769-c1df-47e1-a61218e69ab6-55e4-4c8a"
    }

    # Send a GET request to the specified URL with the headers

    response =  requests.get(url, headers=headers)

    if response.status_code == 200:
            # Extract the filename from the URL
            filename = url.split('/')[-1]
            # Save the response content to a file
            with open(filename, 'wb') as file:
                file.write(response.content)
            print('File downloaded successfully.')
            # Wait for 5 seconds before calling the main function as it takes about 1.2 seconds to download 1 minute 1080p file.
            # 3.8 seconds buffer period.
            time.sleep(5)
            main(filename)
            return jsonify({'filename': filename})
    else:
            print('Failed to download the file.')
            return None





def main(filename):
    results = {}


    mot_tracker = Sort()

    # load models
    coco_model = YOLO('yolov8n.pt')
    license_plate_detector = YOLO('/Users/aaryandua/Downloads/FullStack ANPR/fullstack_anpr/models/license_plate_detector.pt')

    # load video
    cap = cv2.VideoCapture('/Users/aaryandua/Downloads/FullStack ANPR/fullstack_anpr/' + filename)

    vehicles = [2, 3, 5, 7]

    # read frames
    frame_nmr = -1
    ret = True
    while ret:
        
        frame_nmr += 1
        ret, frame = cap.read()
        if ret:
            
            results[frame_nmr] = {}
            # detect vehicles
            detections = coco_model(frame)[0]
            detections_ = []
            for detection in detections.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = detection
                if int(class_id) in vehicles:
                    detections_.append([x1, y1, x2, y2, score])

            # track vehicles
            track_ids = mot_tracker.update(np.asarray(detections_))

            # detect license plates

            license_plates = license_plate_detector(frame)[0]
            for license_plate in license_plates.boxes.data.tolist():
                start = time.time()
                x1, y1, x2, y2, score, class_id = license_plate
                # draw a rectangle around the license plate

                # assign license plate to car
                xcar1, ycar1, xcar2, ycar2, car_id = get_car(license_plate, track_ids)
                frame = cv2.rectangle(frame, (int(xcar1), int(ycar1)), (int(xcar2), int(ycar2)), (0, 255, 0), 2)
                frame = cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                
                
                if car_id != -1:

                    # crop license plate
                    license_plate_crop = frame[int(y1):int(y2), int(x1): int(x2), :]

                    # process license plate
                    license_plate_crop_gray = cv2.cvtColor(license_plate_crop, cv2.COLOR_BGR2GRAY)
                    _, license_plate_crop_thresh = cv2.threshold(license_plate_crop_gray, 90, 255, cv2.THRESH_BINARY_INV)
                    cv2.imwrite('public/license_plate.png', license_plate_crop_gray)
                    cv2.imwrite('public/license_plate_thresh.png', license_plate_crop_thresh)
                    time.sleep(4)
                    license_plate_text, license_plate_text_score = read_license_plate(license_plate_crop_thresh)

                    if license_plate_text:
                        confidence_threshold = 0.5  # Set the confidence threshold (e.g., 0.6 for 60%)

                        # Determine if the confidence is above the threshold
                        #API KEY AND VERIFICATION HAS BEEN REMOVED BY GITHUB DUE TO SECURITY REASONS
                        is_vahan_verified = license_plate_text_score >= confidence_threshold 

                        # Add "Vahan Verified" field to the results
                        results[frame_nmr][car_id] = {
                            'car': {'bbox': [xcar1, ycar1, xcar2, ycar2]},
                            'license_plate': {
                                'bbox': [x1, y1, x2, y2],
                                'text': license_plate_text,
                                'bbox_score': score,
                                'text_score': license_plate_text_score,
                                'Vahan_Verified': 'TRUE' if is_vahan_verified else 'FALSE'
                            }
                        }


                        cv2.putText(frame, license_plate_text, (int(x1), int(y1)), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                        cv2.imwrite('public/image.png', frame)

                    # Write the updated results to a CSV file
                    write_csv(results, 'public/test.csv')


    with open('public/test.csv', 'r') as file:
        reader = csv.DictReader(file)
        data = list(reader)

        # Interpolate missing data
        interpolated_data = interpolate_bounding_boxes(data)

    # Add a "Vahan Verified" field
    for entry in interpolated_data:
        confidence = float(entry['license_number_score'])
        if confidence > 70:
            entry['Vahan Verified'] = 'TRUE'
        else:
            entry['Vahan Verified'] = 'FALSE'

    header = ['frame_nmr', 'car_id', 'car_bbox', 'license_plate_bbox', 'license_plate_bbox_score', 'license_number', 'license_number_score', 'Vahan_Verified']

    with open('public/test_interpolated.csv', 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=header)
        writer.writeheader()
        writer.writerows(interpolated_data)


if __name__ == '__main__':
    app.run(debug=True, port=3000)
