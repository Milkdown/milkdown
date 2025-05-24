<<in {item, name, depth=0}>>

<<h " ".repeat(depth)>> #### enum `<<h name>>`
<<if item.description>>␤<<indent {text: item.description, depth: depth + 3}>><</if>>
<<for name, member in item.properties>>
␤␤<<h " ".repeat(depth + 2)>> * **`<<h name>>`**
<<if member.description>>\␤<<indent {text: member.description, depth: depth + 5}>><</if>>
<</for>>
