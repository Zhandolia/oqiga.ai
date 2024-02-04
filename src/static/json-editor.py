#!/usr/bin/python3

import json

with open("data.json") as file:
    data = json.load(file)

steps = []
stepsNum = input("How many steps? ")
for n in range(int(stepsNum)):
    steps.append(
        {
            "id": n + 1,
            "title": input("Enter case step title: "),
            "image": input("Enter case step image: "),
            "caption": input("Enter case step caption: ")
        }
    )

data.append(
    {
        "id": len(data) + 1,
        "company": input("Enter company: "),
        "description": input("Enter description: "),
        "image": input("Enter image name: "),
        "link": input("Enter link: "),
        "caseStudy":
        {
            "description": input("Enter case description: "),
            "role": input("Enter case role: "),
            "method": input("Enter case method: "),
            "steps": steps
        }
    }
)


with open('./data.json', 'w') as json_file:
    json.dump(data, json_file, indent=4)