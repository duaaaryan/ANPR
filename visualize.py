import ast

import cv2
import numpy as np
import pandas as pd
from add_missing_data import interpolate_bounding_boxes
import csv

def visualize():
    results = pd.read_csv('/Users/aaryandua/Downloads/automatic-number-plate-recognition-python-yolov8-main/test_interpolated.csv')

    # load video
    video_path = '/Users/aaryandua/Downloads/automatic-number-plate-recognition-python-yolov8-main/iscon_p1_l2.mp4'
    cap = cv2.VideoCapture(video_path)
    out = cv2.VideoWriter('output-new.mp4', cv2.VideoWriter_fourcc(*'MP4V'), 15, (1920, 1080))
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
            cv2.imshow('frame', frame)       
            cv2.waitKey(1)
    cap.release()
        
visualize()