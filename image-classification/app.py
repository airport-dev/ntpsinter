import boto3
import base64
import json
import numpy as np
import logging
import traceback,sys
from chalice import Chalice

app = Chalice(app_name='image-classification-narita')
app.debug = True

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# application/octet-streamはファイルの種類を気にしない
@app.route('/rekognition', methods=['POST'], content_types=['application/octet-stream'], cors=True)
def rekognition():

    try:
        body_data = app.current_request.raw_body
        body_data = body_data.split(b'base64,')

        image = base64.b64decode(body_data[1])

        rekognition_client = boto3.client('rekognition', region_name='ap-northeast-1')

        logger.info('Invoke Rekognition')
        res = rekognition_client.detect_faces(
                        Image = { 'Bytes': image },
                        Attributes= ["ALL"]
                    )
        #translate_client = boto3.client('translate', region_name='ap-northeast-1')
        # out = ''
        # for label in res['FaceDetails'] :
        #     trans = translate_client.translate_text(Text=label['Gender']['Value'], 
        #                 SourceLanguageCode='en', TargetLanguageCode='ja')

        #     out += '[en] {} / [ja] {} / [Confidence] {:.2f}%,'.format(
        #                 label['Gender']['Value'], trans.get('TranslatedText'), label['Confidence']
        #             )

        # return out[:-1]
        return res

    except Exception as e:
        tb = sys.exc_info()[2]
        return 'error:{0}'.format(e.with_traceback(tb))