import pickle

index = pickle.load(open("data/image_index.pkl", "rb"))

print("Total items:", len(index))
print("First item:", index[0])
print("Keys:", index[0].keys())
print("Hash type:", type(index[0].get("hash")))
