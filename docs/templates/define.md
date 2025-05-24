<<in {item, name, static, abstract, depth=0}>>
<<in {isFn=!static && !abstract && item.type === "Function" && !item.optional && item.signatures[0].type != "constructor" && item.id.indexOf('.') < 0}>>
<<in {isVar=!static && !abstract && item.type !== "Function" && !item.optional && item.id.indexOf('.') < 0}>>

<<if isFn>>
<<h " ".repeat(depth)>> #### <<h name>> `<<fntype item.signatures[0]>>`
<<elif isVar>>
<<h " ".repeat(depth)>> #### <<h name>> `<<if item.type>>: <<type item>><</if>>`
<<else>>
<<h " ".repeat(depth)>> * <<if abstract>>`abstract `<</if>><<if static>>`static `<</if>>
<<if item.type == "Function" && !item.optional>>
<<if item.signatures[0].type == "constructor">>`new `<</if>>**`<<h name>>`**`<<fntype item.signatures[0]>>`
<<else>>
**`<<h name>>`**`<<if item.optional>>?<</if>><<if item.type>>: <<type item>><</if>>`
<</if>>
<</if>>

<<for sig item.signatures?.slice(1) || []>>
<<if isFn>>␤<<else>>\␤<</if>>
<<h " ".repeat(depth + 3)>><<if sig.type == "constructor">>`new `<</if>>**`<<h name>>`**`<<fntype sig>>`
<</for>>
<<if item.description>>
<<if isFn||isVar>>␤<<else>>\␤<</if>>
<<indent {text: item.description, depth: depth + 3}>><</if>>␤␤
<<for name, prop in item.properties || {}>>
<<if hasDescription(prop)>>
<<define {item: prop, name: name, depth: depth + 3}>>
<</if>>
<</for>>
<<for params (item.signatures || []).map(s => s.params.concat(item.typeParams || [])).concat([item.typeParams || []])>>
<<for param params>>
<<if hasDescription(param)>>
<<define {item: param, name: param.name, depth: depth + 3}>>
<</if>>
<</for>>
<</for>>
<<for sig (item.signatures || [])>>
<<if sig.returns && hasDescription(sig.returns)>>
<<define {item: sig.returns, name: "returns", depth: depth + 3}>>
<</if>>
<</for>>
