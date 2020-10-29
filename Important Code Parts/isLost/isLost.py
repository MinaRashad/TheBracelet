import sqlite3
import requests
import json
from datetime import date

con = sqlite3.connect("points.db")
cursor = con.cursor()
cursor.execute("SELECT * FROM log order by Date desc LIMIT 1")
coordsDB = cursor.fetchone()
cursor.close()
con.close()

client_id="4YCXG4R5QPPQP2AMT2PVQYKEBKXJTCR2CCAGPD5SBGW4ZHPF"
client_secret="URRAO4CB4GCLB1YDICP5AXKW1Z4FO1BMLY5PCKMGG4CE2L24"
version = str(date.today()).replace("-","")

with open("categories.json") as f:
    nonChild = json.load(f)['nonChild']

RADIUS = 1000 # Getting in 1km radius
NumOfSafeVenues = 0
url =  f'https://api.foursquare.com/v2/venues/explore?&client_id={client_id}&client_secret={client_secret}&v={version}&ll={coordsDB[1]},{coordsDB[0]}&radius={RADIUS}'

res = requests.get(url).json()["response"]
availVenues = []
try:
    for v in res['groups'][0]['items']:
        for cat in v['venue']['categories']:
            if cat not in nonChild:
                availVenues.append(cat)

    NumOfSafeVenues = len(availVenues)
except KeyError:
    pass

print(f"Last location is:\n Longitude:{coordsDB[0]}\n Latitude:{coordsDB[0]} \n Date:{coordsDB[2]}")
print(f"The last location has {NumOfSafeVenues} Venues")
if NumOfSafeVenues >=20:
    print("I guess he is a safe Area")
elif NumOfSafeVenues >=10 :
    print("I guess he is in a countryside with low venue count. Maybe he is lost")
else:
    print("I guess he is lost")