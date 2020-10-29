import requests;hostIP = 'http://0.0.0.0'
port = 3005
R = requests.post(f'{hostIP}:{port}/test',{'xtest':5,'ytest':6})
