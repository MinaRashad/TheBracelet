import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
import matplotlib.pyplot as plt

df = pd.read_csv("SampleData.csv")

sampleData = df[["Longitude","Latitude"]].iloc[0:-1,:]

testingData = df[["Longitude","Latitude"]].iloc[-1,:]

X = sampleData['Longitude']
y = sampleData['Latitude']

xTest = testingData[['Longitude']]
yTest = testingData[['Latitude']]

xFit = np.poly1d(np.polyfit(X,y,5))

yFit = np.poly1d(np.polyfit(y,X,1))

predictY = xFit(xTest)
predictX = yFit(yTest)

predicted = (predictX[0],predictY[0])

print(predicted)
print(testingData)

plt.scatter(X,y)
plt.show()