<<in {item, name}>>

#### <<if item.abstract>>abstract <</if>><<h item.kind == "typealias" ? "type" : item.kind>> <<h name>>

<<if item.typeParams>>`<<typeparams item>>`<</if>>
<<if item.extends>> extends <<type item.extends>><</if>>␤␤
<<for impl item.implements || []
>> <<t item.kind == "interface" ? "extends" : "implements">> `<<type impl>>`
<</for>>

␤␤

<<if item.description>><<h item.description>>␤␤<</if>>

<<if item.construct>>
<<define {item: item.construct, name: name}>>
<</if>>

<<if item.instanceProperties>>
<<for name, prop in item.instanceProperties>><<define {item: prop, name: name}>><</for>>
<</if>>

<<if item.properties>>
<<for name, prop in item.properties>><<define {item: prop, name: name, static: item.kind == "class"}>><</for>>
<</if>>
