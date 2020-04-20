FROM ubuntu:18.04
MAINTAINER Kim Woo Jae <woojae9488@naver.com>
WORKDIR /usr/src/app
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && \
  apt-get install -y python3 python3-pip && \
  pip3 install --upgrade pip && \
  apt-get install -y python3-opencv libzbar0
RUN apt-get install -y tesseract-ocr tesseract-ocr-kor
COPY requirements.txt ./
RUN pip3 install -r requirements.txt
COPY . ./
EXPOSE 8099
CMD [ "python3", "app.py" ]
