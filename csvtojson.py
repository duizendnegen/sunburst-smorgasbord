import pandas as pd

data = pd.read_csv("assets/ingredients.csv")

jdata = data.to_json(orient='records')
#print(jdata)

f = open("assets/autoingredients.json", "w")
f.write(f"{jdata}")
f.close()
