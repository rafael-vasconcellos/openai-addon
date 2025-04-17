const { jsonrepair } = require("jsonrepair") as typeof import('jsonrepair')


const brokenResponseString = `
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos magni, consequuntur eius provident, quo ratione fuga recusandae laudantium maiores reiciendis, ullam aperiam similique quidem sunt magnam tempora quis deleniti nihil?

    { 
        "0": "Lorem ipsum dolor sit amet consectetur adipisicing elit.", 
        "1": "Quos magni, consequuntur eius provident, quo ratione fuga recusandae laudantium", 
        "2": "maiores reiciendis, ullam aperiam similique quidem", 
        "3": "sunt magnam tempora quis deleniti nihil?"
    
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos magni, consequuntur eius provident, quo ratione fuga recusandae laudantium maiores reiciendis, ullam aperiam similique quidem sunt magnam tempora quis deleniti nihil?
`

const brokenJsonString = brokenResponseString.replace(/.*?({.*}(?=\s|$)|{.*)/s, '$1')
const repairedJsonString = jsonrepair(brokenJsonString)
console.log(
    repairedJsonString.trim().endsWith("}")
)


