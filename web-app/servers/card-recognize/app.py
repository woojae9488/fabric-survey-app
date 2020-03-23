from flask import Flask, make_response, request
from flask_cors import CORS
import json

from config import *
from StudentCard import *
from ApiError import *

App = Flask(__name__)
cors = CORS(App,
            resources={r'*': {'origins': ENV.ADDR_API_GATEWAY}},
            headers='Content-Type: application/json')


@App.route('/student-card', methods=['POST'])
def studentcard():
    print('Process student card routine')
    response = {'message': '', 'data': {}}
    status = 200

    try:
        reqData = request.get_json(silent=True)
        imgData = reqData.get('imgData')
        studentCard = StudentCard(imgData)
        studentInfo = studentCard.extractStudentInfo()

        response['message'] = 'Success'
        response['data'] = studentInfo
    except ApiError as e:
        print(e)
        status = e.status
        response['message'] = e.error
    except Exception as e:
        print(e)
        status = 500
        response['message'] = 'Server Error'
    finally:
        responseJSON = json.dumps(response)
        print('Finish student card routine')
        print(responseJSON)
        return make_response(responseJSON, status)


if __name__ == '__main__':
    App.run(host='0.0.0.0', port=ENV.PORT)
