import os
current = os.getcwd();
for root, dirs, files in os.walk(os.getcwd + os.sep + "preload" + os.sep + "parts"):
    for name in files:
        print(os.path.join(root, name))