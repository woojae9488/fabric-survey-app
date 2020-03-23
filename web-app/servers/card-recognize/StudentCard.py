import base64
import cv2
import json
import numpy as np
import os
import pyzbar.pyzbar as pyzbar
import pytesseract
import random
import re
import requests

from ApiError import *


class StudentCard:
    W = 1000
    H = 1600

    def __init__(self, imgStr):
        imgPath = 'tmp/sc_' + str(random.randint(0, 100000)) + '.png'
        self.studentInfo = {}

        metadataLen = imgStr.find(',')
        if not self.__checkImageType(imgStr[:metadataLen]):
            raise ImageTypeUnmatchError

        self.imgByte = base64.b64decode(imgStr[metadataLen+1:])
        with open(imgPath, 'wb') as f:
            f.write(self.imgByte)
        imgData = cv2.imread(imgPath, cv2.IMREAD_GRAYSCALE)
        self.image = cv2.resize(imgData, (self.W, self.H))

        os.remove(imgPath)

    def __checkImageType(self, imgType):
        regex = re.compile(r'^(data:image/\w{3,4};base64)$')
        return regex.search(imgType)

    def extractStudentInfo(self):
        self.loadDataOfImg()
        self.loadQRcode()
        return self.studentInfo

    def loadDataOfImg(self):
        kernel = np.ones((3, 3), np.uint8)
        erodedImg = cv2.erode(self.image, kernel, iterations=1)
        textsOfImg = pytesseract.image_to_string(erodedImg, lang='kor')
        texts = textsOfImg.split('\n')

        filteredTexts = list(
            filter(lambda text: True if text.strip() != '' else False, texts))
        results = self.__filterStudentInfo(filteredTexts)

        if not results or not re.compile(r'(학[과|부])$').search(results[1]):
            raise StudentCardReadError
        self.studentInfo['name'] = results[0].rstrip('학생')
        self.studentInfo['department'] = results[1]

    def __filterStudentInfo(self, texts):
        regex = re.compile(r'(학생)$')

        for index, text in enumerate(texts):
            if regex.search(text):
                return texts[index: index+2]
        return None

    def loadQRcode(self):
        QRcode = pyzbar.decode(self.image)

        values = list(map(lambda value: value.data.decode('utf-8'), QRcode))
        response = requests.get(values[0])
        results = json.loads(response.text)

        if results['RESULT'] == 'FAIL':
            raise QRcodeReadError
        self.studentInfo['role'] = 'student'
        self.studentInfo['id'] = results['userid']
