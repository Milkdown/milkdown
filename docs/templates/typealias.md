<<in {item, name, depth=0}>>

<<h " ".repeat(depth)>> #### type <<h name>>
`<<typeparams item>> = <<type item>>`
<<if item.description>>␤<<indent {text: item.description, depth: depth + 3}>><</if>>␤␤
<<for name, prop in item.properties || {}>>
<<if hasDescription(prop)>>
<<define {item: prop, name: name, depth: depth + 3}>>
<</if>>
<</for>>
