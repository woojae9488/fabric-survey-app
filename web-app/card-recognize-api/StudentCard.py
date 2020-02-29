import base64
import cv2
import matplotlib.pyplot as plt
import os
import pyzbar.pyzbar as pyzbar
from pytesseract import *
import random
import re
import requests

from ApiError import *


class StudentCard:
    def __init__(self, imgStr):
        self.IMG_PATH = 'tmp/sc_' + str(random.randint(0, 100000)) + '.png'
        self.studentInfo = {}
        self.infoROI = {}

        metadataLen = imgStr.find(',')
        if not self.__checkImageType(imgStr[:metadataLen]):
            raise ImageTypeUnmatchError

        self.imgData = base64.b64decode(imgStr[metadataLen+1:])
        with open(self.IMG_PATH, 'wb') as f:
            f.write(self.imgData)
        self.img = cv2.imread(self.IMG_PATH)
        os.remove(self.IMG_PATH)

    def extractStudentInfo(self):
        self.loadQRcode()
        self.loadDataOfImg()
        return self.studentInfo

    def loadDataOfImg(self):
        infoImg = self.img[self.infoROI['y1']:self.infoROI['y2'],
                           self.infoROI['x1']:self.infoROI['x2']]
        strOfImage = image_to_string(infoImg, lang='kor')
        datas = strOfImage.strip("'").split('\n')

        results = list(
            filter(lambda data: True if data != '' else False, datas))
        self.studentInfo['name'] = results[0]
        self.studentInfo['department'] = results[1]
        self.studentInfo['id'] = results[2]

        if not self.__checkStudentInfo():
            raise StudentCardReadError

    def __checkImageType(self, imgType):
        regex = re.compile(r'^(data:image/\w{3,4};base64)$')
        if regex.search(imgType):
            return True
        else:
            return False

    def __checkStudentInfo(self):
        if self.studentInfo['department'].find(" ") >= 0:
            return False
        if self.studentInfo['department'].find("학과") < 0 and self.studentInfo['department'].find("학부") < 0:
            return False
        if self.studentInfo['name'].find(" ") >= 0:
            return False
        if self.studentInfo['id'].find(" ") >= 0:
            return False
        if not self.studentInfo['id'].isdigit():
            return False
        if int(self.studentInfo['id']) < 50000:
            return False

        return True

    def loadQRcode(self):
        grayImg = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        QRcode = pyzbar.decode(grayImg)
        self.__setInfoROIByQRcode(QRcode)

        values = list(map(lambda value: value.data.decode('utf-8'), QRcode))
        response = requests.get(values[0])
        QRdatas = response.text.split('"')
        results = list(
            filter(lambda data: True if data != '' else False, QRdatas))

        if results[7] == "FAIL":
            raise QRcodeReadError
        elif results[7] == "SUCCESS":
            self.studentInfo['role'] = 'student'

    def __setInfoROIByQRcode(self, QRcode):
        x = QRcode[0].rect[0]
        y = QRcode[0].rect[1]
        w = QRcode[0].rect[2]
        h = QRcode[0].rect[3]
        self.infoROI['x1'] = x - int(0.75*w)
        self.infoROI['x2'] = x + int(0.55*w)
        self.infoROI['y1'] = y + int(1.3*w)
        self.infoROI['y2'] = y + int(2.25*w)
